import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { EmailSchema, PasswordSchema, normalizeSearch } from '@aljeel/shared';
import { loadConfig } from './config.js';
import { createDb, transaction } from './db.js';
import { hashPassword, randomToken } from './security.js';
import { audit } from './audit.js';

async function hiddenPassword(prompt: string): Promise<string> {
  if (!stdin.isTTY) throw new Error('Use an interactive terminal for owner setup');
  stdout.write(prompt);
  stdin.setRawMode(true); stdin.resume();
  return new Promise((resolve, reject) => {
    let value = '';
    const finish = () => { stdin.off('data', onData); stdin.setRawMode(false); stdin.pause(); stdout.write('\n'); };
    const onData = (chunk: Buffer) => {
      for (const char of chunk.toString('utf8')) {
        if (char === '\u0003') { finish(); reject(new Error('Cancelled')); return; }
        if (char === '\r' || char === '\n') { finish(); resolve(value); return; }
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
        else if (char >= ' ') value += char;
      }
    };
    stdin.on('data', onData);
  });
}
const config = loadConfig();
const db = createDb(config.DATABASE_URL);
try {
  if (!stdin.isTTY) throw new Error('Owner seed requires an interactive terminal; no credentials are accepted as command arguments');
  if (await db.user.count({ where: { role: 'owner' } }) > 0) throw new Error('An owner already exists. Use staff management for additional users.');
  const reader = createInterface({ input: stdin, output: stdout });
  const email = EmailSchema.parse(await reader.question('Owner email: '));
  const name = (await reader.question('Owner name: ')).trim();
  reader.close();
  if (!name || name.length > 100) throw new Error('Name must have 1–100 characters');
  const entered = await hiddenPassword('Password (minimum 12 characters; Enter generates one): ');
  const password = PasswordSchema.parse(entered || randomToken());
  if (entered && await hiddenPassword('Confirm password: ') !== entered) throw new Error('Passwords do not match');
  const passwordHash = await hashPassword(password);
  await transaction(db, async tx => {
    if (await tx.user.count({ where: { role: 'owner' } }) > 0) throw new Error('An owner already exists');
    const user = await tx.user.create({ data: { email, name, nameSearch: normalizeSearch(name), passwordHash, role: 'owner', mustChangePassword: true } });
    await audit(tx, config, null, { userId: user.id, action: 'staff.owner_seeded', entity: 'User', entityId: user.id, after: { role: 'owner', mustChangePassword: true } });
  });
  if (!entered) stdout.write(`Generated password (shown once): ${password}\n`);
  stdout.write('Owner created. Password change is required on first login.\n');
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Owner setup failed');
  process.exitCode = 1;
} finally { await db.$disconnect(); }
