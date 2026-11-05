import { loadConfig } from './config.js';
import { createDb } from './db.js';
import { buildApp } from './app.js';
import { ensureRemoteCommerceSchema } from './ensure-pricing-rule-schema.js';

const config = loadConfig();
const db = createDb(config.DATABASE_URL);

if (process.env.ENSURE_REMOTE_SCHEMA === 'true' || config.NODE_ENV === 'production') {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await ensureRemoteCommerceSchema(db);
      break;
    } catch (error) {
      if (attempt >= 4) {
        console.warn('Remote schema ensure failed at startup (API may error until DB is reachable):', error);
      } else {
        await new Promise(r => setTimeout(r, 3000 * (attempt + 1)));
      }
    }
  }
}

const app = await buildApp(config, db);
async function close() { await app.close(); await db.$disconnect(); }
process.once('SIGINT', () => { void close(); });
process.once('SIGTERM', () => { void close(); });
await app.listen({ host: config.HOST, port: config.PORT });
