import { existsSync } from 'node:fs';
import { config } from 'dotenv';

if (!existsSync('server/dist/index.js') || !existsSync('dist/index.html') || !existsSync('admin/dist/index.html')) {
  throw new Error('Run npm run build:all first.');
}

const envPath = existsSync('.env.hostinger') ? '.env.hostinger' : '.env';
config({ path: envPath, quiet: true });

const database = new URL(process.env.DATABASE_URL ?? '');
if (['127.0.0.1', 'localhost', '::1'].includes(database.hostname)) {
  throw new Error(
    'start:cloud expects a remote DATABASE_URL (e.g. Hostinger). Use npm run start:local for loopback MariaDB.'
  );
}

// HTTP preview on loopback; data from remote MySQL (same as Cursor Cloud full stack).
const port = process.env.START_CLOUD_PORT?.trim() || '53000';
Object.assign(process.env, {
  NODE_ENV: 'development',
  HOST: '127.0.0.1',
  PORT: port,
  COOKIE_SECURE: 'false',
  TRUST_PROXY: 'false',
  SERVE_STATIC: 'true',
  ENSURE_REMOTE_SCHEMA: 'true',
  USE_REMOTE_DB: 'true',
  ALLOWED_ORIGINS: `http://127.0.0.1:${port},http://localhost:${port}`,
});
console.log(`start:cloud → http://127.0.0.1:${port}/admin/ (remote DB)`);

await import('../../server/dist/index.js');
