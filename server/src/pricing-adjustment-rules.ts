import {Prisma, type PrismaClient, type ProductVariant} from '@prisma/client';

export function specsWithoutDiscountJson(specs: unknown): Prisma.InputJsonValue {
  const obj =
    specs && typeof specs === 'object' && !Array.isArray(specs)
      ? {...(specs as Record<string, unknown>)}
      : {};
  delete obj.originalPriceUsd;
  return obj as Prisma.InputJsonValue;
}

export type VariantPriceSnapshot = {
  variantId: string;
  productId: string;
  priceUsd: string | null;
  originalPriceUsd: string | null;
  discountPercent: string | null;
  specsOriginalPriceUsd: number | null;
};

type VariantWithProduct = ProductVariant & {product?: {specs: unknown}};

export function snapshotVariant(v: VariantWithProduct): VariantPriceSnapshot {
  const specs = (v.specs || {}) as Record<string, unknown>;
  const specOrig = specs.originalPriceUsd;
  return {
    variantId: v.id,
    productId: v.productId,
    priceUsd: v.priceUsd !== null ? String(v.priceUsd) : null,
    originalPriceUsd: v.originalPriceUsd !== null ? String(v.originalPriceUsd) : null,
    discountPercent: v.discountPercent !== null ? String(v.discountPercent) : null,
    specsOriginalPriceUsd:
      typeof specOrig === 'number' && !Number.isNaN(specOrig)
        ? specOrig
        : typeof specOrig === 'string' && specOrig !== '' && !Number.isNaN(Number(specOrig))
          ? Number(specOrig)
          : null
  };
}

function decimalOrNull(value: string | null): Prisma.Decimal | null {
  if (value === null || value === '') return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return new Prisma.Decimal(n.toFixed(2));
}

export async function restoreVariantSnapshot(
  tx: Prisma.TransactionClient,
  item: VariantPriceSnapshot
): Promise<void> {
  const price = decimalOrNull(item.priceUsd);
  const orig = decimalOrNull(item.originalPriceUsd);
  const discount = decimalOrNull(item.discountPercent);
  const variant = await tx.productVariant.findUnique({
    where: {id: item.variantId},
    include: {product: true}
  });
  if (!variant) return;
  const vSpecs = (variant.specs || {}) as Record<string, unknown>;
  const nextSpecs = {...vSpecs};
  if (item.specsOriginalPriceUsd !== null) nextSpecs.originalPriceUsd = item.specsOriginalPriceUsd;
  else delete nextSpecs.originalPriceUsd;
  await tx.productVariant.update({
    where: {id: item.variantId},
    data: {
      priceUsd: price,
      originalPriceUsd: orig,
      discountPercent: discount,
      specs: nextSpecs as Prisma.InputJsonValue
    }
  });
}

export async function syncProductsFromVariants(
  tx: Prisma.TransactionClient,
  productIds: string[]
): Promise<void> {
  const unique = [...new Set(productIds)];
  for (const productId of unique) {
    const variant = await tx.productVariant.findFirst({
      where: {productId, active: true},
      orderBy: {createdAt: 'asc'}
    });
    if (!variant) continue;
    const pSpecs = (
      await tx.product.findUnique({where: {id: productId}, select: {specs: true}})
    )?.specs as Record<string, unknown> | undefined;
    const vSpecs = (variant.specs || {}) as Record<string, unknown>;
    const nextProdSpecs = {...(pSpecs || {}), ...(vSpecs.originalPriceUsd !== undefined ? {originalPriceUsd: vSpecs.originalPriceUsd} : {})};
    if (vSpecs.originalPriceUsd === undefined && nextProdSpecs.originalPriceUsd !== undefined) {
      delete nextProdSpecs.originalPriceUsd;
    }
    await tx.product.update({
      where: {id: productId},
      data: {
        priceUsd: variant.priceUsd,
        originalPriceUsd: variant.originalPriceUsd,
        discountPercent: variant.discountPercent,
        priceUpdatedAt: new Date(),
        specs: nextProdSpecs as Prisma.InputJsonValue
      }
    });
  }
}

const BULK_REASON = /^(adjust_price|adjust_percent):/;

export function invertBulkAdjustFromReason(reason: string, priceAfter: number): number | null {
  const pctMatch = reason.match(/^adjust_(?:price|percent):(-?\d+(?:\.\d+)?)%$/);
  if (pctMatch) {
    const pct = Number(pctMatch[1]);
    if (!pct || Number.isNaN(pct)) return null;
    const factor = 1 + pct / 100;
    if (factor <= 0) return null;
    return Math.max(1, parseFloat((priceAfter / factor).toFixed(2)));
  }
  const fixedMatch = reason.match(/^adjust_price:\$(-?\d+(?:\.\d+)?)$/);
  if (fixedMatch) {
    const amt = Number(fixedMatch[1]);
    if (Number.isNaN(amt)) return null;
    return Math.max(1, parseFloat((priceAfter - amt).toFixed(2)));
  }
  return null;
}

export async function restorePricesFromBulkHistory(
  tx: Prisma.TransactionClient,
  userId: string
): Promise<number> {
  const variants = await tx.productVariant.findMany({
    where: {active: true, priceUsd: {not: null}},
    include: {product: true}
  });
  let updatedCount = 0;
  const touchedProducts = new Set<string>();

  for (const v of variants) {
    if (!v.priceUsd) continue;
    const history = await tx.priceHistory.findMany({
      where: {
        productId: v.productId,
        reason: {not: null}
      },
      orderBy: {changedAt: 'desc'}
    });
    const bulkEntries = history.filter(h => h.reason && BULK_REASON.test(h.reason));
    if (!bulkEntries.length) continue;

    let price = Number(v.priceUsd);
    const orig = v.originalPriceUsd ? Number(v.originalPriceUsd) : null;

    for (const entry of bulkEntries) {
      const reason = entry.reason!;
      const inverted = invertBulkAdjustFromReason(reason, price);
      if (inverted === null) continue;
      price = inverted;
    }

    const newDiscount =
      orig && orig > price ? parseFloat((((orig - price) / orig) * 100).toFixed(2)) : null;

    const vSpecs = (v.specs || {}) as Record<string, unknown>;
    await tx.productVariant.update({
      where: {id: v.id},
      data: {
        priceUsd: new Prisma.Decimal(price.toFixed(2)),
        originalPriceUsd: orig !== null ? new Prisma.Decimal(orig.toFixed(2)) : v.originalPriceUsd,
        discountPercent:
          newDiscount !== null ? new Prisma.Decimal(newDiscount.toFixed(2)) : v.discountPercent
      }
    });
    touchedProducts.add(v.productId);
    await tx.priceHistory.create({
      data: {
        productId: v.productId,
        priceUsd: new Prisma.Decimal(price.toFixed(2)),
        originalPriceUsd: orig !== null ? new Prisma.Decimal(orig.toFixed(2)) : v.originalPriceUsd,
        discountPercent:
          newDiscount !== null ? new Prisma.Decimal(newDiscount.toFixed(2)) : v.discountPercent,
        changedBy: userId,
        reason: 'restore_pre_bulk_adjustments',
        changeType: 'price'
      }
    });
    updatedCount++;
  }

  await syncProductsFromVariants(tx, [...touchedProducts]);
  return updatedCount;
}

export async function executeClearDiscounts(
  tx: Prisma.TransactionClient,
  input: {category?: string; variantIds?: string[]},
  trackRule: boolean,
  ruleSnapshots: VariantPriceSnapshot[]
): Promise<{updatedCount: number; productIds: string[]}> {
  const productWhere: Prisma.ProductWhereInput = {
    deletedAt: null,
    ...(input.category && input.category !== 'all' ? {category: input.category} : {}),
    ...(input.variantIds?.length ? {variants: {some: {id: {in: input.variantIds}}}} : {})
  };
  const products = await tx.product.findMany({
    where: productWhere,
    include: {variants: true}
  });

  const snapshotVariantIds = new Set<string>();
  let updatedCount = 0;
  const productIds: string[] = [];

  for (const product of products) {
    const variantsToClear = input.variantIds?.length
      ? product.variants.filter(v => input.variantIds!.includes(v.id))
      : product.variants;

    if (!variantsToClear.length) continue;

    for (const v of variantsToClear) {
      if (trackRule && !snapshotVariantIds.has(v.id)) {
        ruleSnapshots.push(snapshotVariant({...v, product}));
        snapshotVariantIds.add(v.id);
      }
      await tx.productVariant.update({
        where: {id: v.id},
        data: {
          originalPriceUsd: null,
          discountPercent: null,
          specs: specsWithoutDiscountJson(v.specs)
        }
      });
      updatedCount++;
    }

    await tx.product.update({
      where: {id: product.id},
      data: {
        originalPriceUsd: null,
        discountPercent: null,
        specs: specsWithoutDiscountJson(product.specs)
      }
    });
    productIds.push(product.id);
  }

  await syncProductsFromVariants(tx, productIds);
  return {updatedCount, productIds};
}

export function buildRuleSummary(
  action: string,
  params: Record<string, unknown>
): string {
  const cat = params.category ? String(params.category) : 'all';
  const min = params.priceMin !== undefined ? `$${params.priceMin}` : '0';
  const max = params.priceMax !== undefined ? `$${params.priceMax}` : '∞';
  if (action === 'adjust_price') {
    if (typeof params.percent === 'number') {
      const sign = params.percent >= 0 ? '+' : '';
      return `adjust_price ${sign}${params.percent}% · cat=${cat} · range ${min}-${max}`;
    }
    if (typeof params.fixedAmount === 'number') {
      const sign = params.fixedAmount >= 0 ? '+' : '';
      return `adjust_price ${sign}$${params.fixedAmount} · cat=${cat} · range ${min}-${max}`;
    }
  }
  if (action === 'apply_discount' && typeof params.percent === 'number') {
    return `apply_discount ${params.percent}% · cat=${cat} · range ${min}-${max}`;
  }
  if (action === 'set_fixed' && typeof params.fixedPrice === 'number') {
    return `set_fixed $${params.fixedPrice}`;
  }
  if (action === 'clear_discounts') {
    return `clear_discounts · cat=${cat}`;
  }
  if (action === 'adjust_percent' && typeof params.percent === 'number') {
    return `adjust_percent ${params.percent}% · cat=${cat}`;
  }
  return action;
}

export async function persistPricingRule(
  tx: Prisma.TransactionClient,
  userId: string,
  action: string,
  params: Record<string, unknown>,
  snapshots: VariantPriceSnapshot[]
): Promise<string | null> {
  if (!snapshots.length) return null;
  const row = await tx.priceAdjustmentRule.create({
    data: {
      action,
      summary: buildRuleSummary(action, params),
      params: params as Prisma.InputJsonValue,
      items: snapshots as unknown as Prisma.InputJsonValue,
      itemCount: snapshots.length,
      createdBy: userId
    }
  });
  return row.id;
}

export async function revertPricingRule(
  tx: Prisma.TransactionClient,
  db: PrismaClient,
  ruleId: string
): Promise<number> {
  const rule = await tx.priceAdjustmentRule.findUnique({where: {id: ruleId}});
  if (!rule) throw new Error('not_found');
  if (rule.revertedAt) throw new Error('already_reverted');

  const items = rule.items as unknown as VariantPriceSnapshot[];
  const variantIds = items.map(i => i.variantId);

  const newerOverlap = await db.priceAdjustmentRule.findFirst({
    where: {
      revertedAt: null,
      createdAt: {gt: rule.createdAt},
      id: {not: ruleId}
    },
    orderBy: {createdAt: 'desc'}
  });
  if (newerOverlap) {
    const newerItems = newerOverlap.items as unknown as VariantPriceSnapshot[];
    const newerSet = new Set(newerItems.map(i => i.variantId));
    if (variantIds.some(id => newerSet.has(id))) {
      throw new Error('revert_newer_first');
    }
  }

  for (const item of items) {
    await restoreVariantSnapshot(tx, item);
  }
  await syncProductsFromVariants(tx, items.map(i => i.productId));
  await tx.priceAdjustmentRule.update({
    where: {id: ruleId},
    data: {revertedAt: new Date()}
  });
  return items.length;
}
