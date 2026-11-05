import type { Prisma } from '@prisma/client';

type PriceLike = { priceUsd: Prisma.Decimal | null; originalPriceUsd: Prisma.Decimal | null };

export function resolveSalePriceUsd(
  variant: PriceLike,
  product: PriceLike
): string | null {
  const raw = variant.priceUsd ?? product.priceUsd;
  if (raw === null || raw === undefined) return null;
  const n = Number(raw);
  if (Number.isNaN(n) || n <= 0) return null;
  return n.toFixed(2);
}

/** Same rule as shop `offers()` — columns only, never specs JSON. */
export function resolveStoreOriginalPriceUsd(
  variant: PriceLike,
  product: PriceLike
): string | null {
  const saleStr = resolveSalePriceUsd(variant, product);
  if (!saleStr) return null;
  const sale = Number(saleStr);
  const columnOrig =
    variant.originalPriceUsd != null
      ? Number(variant.originalPriceUsd)
      : product.originalPriceUsd != null
        ? Number(product.originalPriceUsd)
        : null;
  if (columnOrig === null || Number.isNaN(columnOrig) || columnOrig <= sale) return null;
  return columnOrig.toFixed(2);
}

export function hasStoreDiscount(variant: PriceLike, product: PriceLike): boolean {
  return resolveStoreOriginalPriceUsd(variant, product) !== null;
}

export function resolveStoreDiscountPercent(
  variant: PriceLike,
  product: PriceLike
): number | null {
  const orig = resolveStoreOriginalPriceUsd(variant, product);
  const sale = resolveSalePriceUsd(variant, product);
  if (!orig || !sale) return null;
  return Math.round(((Number(orig) - Number(sale)) / Number(orig)) * 100);
}
