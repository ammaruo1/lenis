import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../../', import.meta.url);
const password = randomBytes(32).toString('hex');
let contents = await readFile(new URL('.env.example', root), 'utf8');
contents = contents.replace(/^POSTGRES_PASSWORD=$/m, `POSTGRES_PASSWORD=${password}`)
  .replace(/^DATABASE_URL=$/m, `DATABASE_URL=postgresql://aljeel:${password}@localhost:5432/aljeel`)
  .replace(/^SESSION_SECRET=$/m, `SESSION_SECRET=${randomBytes(48).toString('hex')}`)
  .replace(/^TOTP_ENCRYPTION_KEY=$/m, `TOTP_ENCRYPTION_KEY=${randomBytes(32).toString('hex')}`);
try {
  await writeFile(new URL('.env', root), contents, { flag: 'wx', mode: 0o600 });
  console.log('Created .env with random local infrastructure secrets. No staff account was created.');
} catch (error) {
  if (error.code === 'EEXIST') console.log('.env already exists; preserved without changes.');
  else throw error;
}
