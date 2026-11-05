import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Prisma } from '@prisma/client';
import { loadConfig } from '../../server/src/config.js';
import { createDb } from '../../server/src/db.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
config({ path: resolve(root, '.env.hostinger'), override: true, quiet: true });
if (!process.env.DATABASE_URL) config({ path: resolve(root, '.env'), override: true, quiet: true });
process.env.USE_REMOTE_DB = 'true';

function strip(specs: unknown): Prisma.InputJsonValue {
  const obj = specs && typeof specs === 'object' && !Array.isArray(specs) ? { ...(specs as Record<string, unknown>) } : {};
  delete obj.originalPriceUsd;
  return obj as Prisma.InputJsonValue;
}

const db = createDb(loadConfig().DATABASE_URL);
const products = await db.product.findMany({ select: { id: true, specs: true } });
const variants = await db.productVariant.findMany({ select: { id: true, specs: true } });
for (const p of products) {
  await db.product.update({
    where: { id: p.id },
    data: { originalPriceUsd: null, discountPercent: null, specs: strip(p.specs) },
  });
}
for (const v of variants) {
  await db.productVariant.update({
    where: { id: v.id },
    data: { originalPriceUsd: null, discountPercent: null, specs: strip(v.specs) },
  });
}
console.log(JSON.stringify({ ok: true, products: products.length, variants: variants.length }));
await db.$disconnect();
