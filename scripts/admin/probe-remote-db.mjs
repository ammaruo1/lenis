import { config } from 'dotenv';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { rootCertificates } from 'node:tls';
import mariadb from 'mariadb';

config({ path: '.env.hostinger', quiet: true });
const raw = process.env.DATABASE_URL;
if (!raw) {
  console.error('missing DATABASE_URL');
  process.exit(1);
}

const u = new URL(raw);
const base = {
  host: u.hostname,
  port: Number(u.port || 3306),
  user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password),
  database: u.pathname.slice(1),
  connectTimeout: 30000,
};

async function tryConnect(label, extra) {
  let conn;
  try {
    conn = await mariadb.createConnection({ ...base, ...extra });
    const rows = await conn.query('SELECT 1 AS ok');
    console.log(`${label}: ok`, rows);
    return true;
  } catch (error) {
    console.error(`${label}: fail`, error.code ?? error.errno, String(error.message).slice(0, 320));
    return false;
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
}

if (u.searchParams.get('ssl') === 'true') {
  await mkdir('.local', { recursive: true });
  const caPath = resolve('.local/mysql-ca.pem');
  await writeFile(caPath, `${rootCertificates.join('\n')}\n`);
  await tryConnect('ssl_true', { ssl: true });
  await tryConnect('ssl_ca', { ssl: { ca: rootCertificates.join('\n'), rejectUnauthorized: true } });
  await tryConnect('ssl_relaxed', { ssl: { rejectUnauthorized: false } });
} else {
  await tryConnect('plain', {});
}
