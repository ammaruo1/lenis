import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../../server/src/config.js';
import { createDb, transaction } from '../../server/src/db.js';
import { restorePricesFromBulkHistory } from '../../server/src/pricing-adjustment-rules.js';
import { ensureRemoteCommerceSchema } from '../../server/src/ensure-pricing-rule-schema.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
config({ path: resolve(root, '.env.hostinger'), override: true, quiet: true });
if (!process.env.DATABASE_URL) {
  config({ path: resolve(root, '.env'), override: true, quiet: true });
}

process.env.USE_REMOTE_DB = 'true';
const cfg = loadConfig();
const db = createDb(cfg.DATABASE_URL);
for (let attempt = 0; attempt < 3; attempt++) {
  try {
    await ensureRemoteCommerceSchema(db);
    break;
  } catch (error) {
    if (attempt === 2) throw error;
    await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
  }
}

const owner = await db.user.findFirst({
  where: { role: 'owner', isActive: true },
  select: { id: true },
});
if (!owner) {
  console.error('No active owner user found');
  process.exit(1);
}

const updatedCount = await transaction(db, async tx =>
  restorePricesFromBulkHistory(tx, owner.id)
);
console.log(JSON.stringify({ ok: true, updatedCount }, null, 2));
await db.$disconnect();
