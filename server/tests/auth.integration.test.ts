import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { Client } from 'pg';
import type { FastifyInstance, LightMyRequestResponse } from 'fastify';
import type { PrismaClient } from '@prisma/client';
import { roles, can, type Role } from '@aljeel/shared';
import { buildApp } from '../src/app.js';
import { ConfigSchema } from '../src/config.js';
import { createDb } from '../src/db.js';
import { hashPassword, hashToken, randomToken, makeTotp, encryptSecret } from '../src/security.js';

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) throw new Error('TEST_DATABASE_URL is required. Use a disposable PostgreSQL database.');
const namespace = `admin_test_${randomUUID().replaceAll('-', '')}`;
const config = ConfigSchema.parse({ NODE_ENV: 'test', DATABASE_URL: databaseUrl, SESSION_SECRET: randomToken(), TOTP_ENCRYPTION_KEY: randomToken().padEnd(64, 'a').slice(0,64).split('').map(c => (c.charCodeAt(0) % 16).toString(16)).join(''), ALLOWED_ORIGINS: 'http://localhost:5174', LOG_LEVEL: 'silent' });
const password = randomToken();
let app: FastifyInstance; let db: PrismaClient; let pg: Client; let passwordHash: string;
type Browser = { cookies: Map<string,string>; csrf: string; token?: string; call: (path: string, method?: string, body?: unknown, headers?: Record<string,string>) => Promise<LightMyRequestResponse> };
function browser(): Browser {
  const result: Browser = { cookies: new Map(), csrf: '', async call(path, method = 'GET', body, extra = {}) {
    const response = await app.inject({ url: `/api/admin${path}`, method: method as 'GET'|'POST'|'PATCH'|'DELETE', headers: { cookie: [...result.cookies].map(([key,value]) => `${key}=${value}`).join('; '), origin: 'http://localhost:5174', 'x-csrf-token': result.csrf, ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...extra }, ...(body !== undefined ? { payload: JSON.stringify(body) } : {}) });
    for (const cookie of response.cookies) { result.cookies.set(cookie.name, cookie.value); if (cookie.name === 'aljeel_session') result.token = cookie.value; }
    try { const data = response.json(); if (data.csrfToken) result.csrf = data.csrfToken; } catch {}
    return response;
  } };
  return result;
}
async function user(role: Role, extra: Record<string,unknown> = {}) { return db.user.create({ data: { email: `${randomUUID()}@example.test`, name: 'Isolated test account', role, passwordHash, mustChangePassword: false, ...extra } }); }
async function login(role: Role, extra: Record<string,unknown> = {}) { const account = await user(role, extra); const client = browser(); await client.call('/auth/csrf'); const response = await client.call('/auth/login','POST',{ email: account.email, password }); return { account, client, response }; }

beforeAll(async () => {
  pg = new Client({ connectionString: databaseUrl }); await pg.connect();
  // Namespace is generated locally, never from user input.
  await pg.query(`CREATE SCHEMA "${namespace}"`); await pg.query(`SET search_path TO "${namespace}"`);
  const migration = (await readFile(new URL('../prisma/migrations/202610020001_foundation/migration.sql', import.meta.url),'utf8')).replace('CREATE SCHEMA IF NOT EXISTS "public";', '');
  await pg.query(migration);
  const url = new URL(databaseUrl!); url.searchParams.set('schema', namespace);
  db = createDb(url.toString()); passwordHash = await hashPassword(password);
  app = await buildApp(config, db, { disableRateLimits: true }); await app.ready();
}, 60000);
afterAll(async () => { if (app) await app.close(); if (db) await db.$disconnect(); if (pg) { await pg.query(`DROP SCHEMA IF EXISTS "${namespace}" CASCADE`); await pg.end(); } });
describe('auth, cookies and account protections', () => {
  it('health checks the database', async () => expect((await app.inject('/api/health')).statusCode).toBe(200));
  it('requires authentication', async () => expect((await browser().call('/users')).statusCode).toBe(401));
  it('enforces CSRF and allowed origins, including on login', async () => { const account = await user('owner'); const client = browser(); expect((await client.call('/auth/login','POST',{ email: account.email, password })).statusCode).toBe(403); await client.call('/auth/csrf'); expect((await client.call('/auth/login','POST',{ email: account.email,password },{origin:'https://evil.example'})).statusCode).toBe(403); });
  it('returns only public user fields and stores token hashes', async () => { const { client,response } = await login('owner'); expect(response.statusCode).toBe(200); expect(response.headers['cache-control']).toBe('no-store'); const user = response.json().user; expect(user).not.toHaveProperty('passwordHash'); expect(user).not.toHaveProperty('totpSecret'); expect(await db.session.findUnique({where:{id:client.token!}})).toBeNull(); expect(await db.session.findUnique({where:{id:hashToken(client.token!)}})).not.toBeNull(); const cookie = response.cookies.find(c => c.name === 'aljeel_session')!; expect(cookie.httpOnly).toBe(true); expect(cookie.sameSite).toBe('Lax'); });
  it('blocks inactive and locked accounts with generic errors', async () => { for (const extra of [{isActive:false},{lockedUntil:new Date(Date.now()+60000)}]) { const {response} = await login('viewer',extra); expect(response.statusCode).toBe(401); expect(response.json().error.code).toBe('invalid_credentials'); } });
  it('locks an account after repeated incorrect passwords', async () => { const account = await user('sales'); const client = browser(); await client.call('/auth/csrf'); for(let i=0;i<5;i++) expect((await client.call('/auth/login','POST',{email:account.email,password:randomToken()})).statusCode).toBe(401); const locked = await db.user.findUniqueOrThrow({where:{id:account.id}}); expect(locked.failedLogins).toBe(5); expect(locked.lockedUntil!.getTime()).toBeGreaterThan(Date.now()); expect((await client.call('/auth/login','POST',{email:account.email,password})).statusCode).toBe(401); }, 20000);
  it('requires first password change and rotates/revokes sessions', async () => { const {account,client,response} = await login('viewer',{mustChangePassword:true}); expect(response.statusCode).toBe(200); const previous = client.token!; expect((await client.call('/dashboard')).json().error.code).toBe('password_change_required'); expect((await client.call('/auth/session')).statusCode).toBe(200); expect((await client.call('/auth/change-password','POST',{currentPassword:password,newPassword:randomToken()})).statusCode).toBe(200); expect(client.token).not.toEqual(previous); expect(await db.session.findUnique({where:{id:hashToken(previous)}})).toBeNull(); expect((await client.call('/dashboard')).statusCode).toBe(200); expect((await db.user.findUniqueOrThrow({where:{id:account.id}})).mustChangePassword).toBe(false); });
  it('expires idle and absolute sessions', async () => { for (const data of [{lastSeenAt:new Date(Date.now()-31*60000)},{createdAt:new Date(Date.now()-60000),expiresAt:new Date(Date.now()-1000)}]) { const {client} = await login('viewer'); await db.session.update({where:{id:hashToken(client.token!)},data}); expect((await client.call('/auth/session')).statusCode).toBe(401); } });
  it('revokes own sessions with object-level protection', async () => { const first = await login('viewer'); const second = await login('viewer'); expect((await first.client.call(`/auth/sessions/${hashToken(second.client.token!)}`,'DELETE')).statusCode).toBe(404); expect((await first.client.call(`/auth/sessions/${hashToken(first.client.token!)}`,'DELETE')).statusCode).toBe(200); expect((await first.client.call('/auth/session')).statusCode).toBe(401); });
  it('logs out and revokes access', async () => { const {client} = await login('viewer'); expect((await client.call('/auth/logout','POST',{})).statusCode).toBe(200); expect((await client.call('/dashboard')).statusCode).toBe(401); });
  it('validates request bodies with Zod and rejects unknown fields', async () => { const {client} = await login('owner'); expect((await client.call('/users','POST',{email:'invalid',name:'',role:'superuser',password:'short'})).statusCode).toBe(400); expect((await client.call('/users','GET',undefined,{})).statusCode).toBe(200); expect((await client.call('/users?page=0')).statusCode).toBe(400); });
  it('rate-limits repeated login attempts from one IP', async () => {
    const limited = await buildApp(config, db); await limited.ready();
    try {
      const csrf = await limited.inject('/api/admin/auth/csrf');
      const cookie = csrf.cookies.map(item => `${item.name}=${item.value}`).join('; ');
      for (let attempt = 0; attempt < 11; attempt++) {
        const response = await limited.inject({ method: 'POST', url: '/api/admin/auth/login', headers: { origin: 'http://localhost:5174', cookie, 'x-csrf-token': csrf.json().csrfToken }, payload: { email: 'missing@example.test', password } });
        expect(response.statusCode).toBe(attempt < 10 ? 401 : 429);
      }
    } finally { await limited.close(); }
  }, 20000);
  it('enforces Secure cookies and hides docs in production', async () => {
    const production = await buildApp({ ...config, NODE_ENV: 'production', COOKIE_SECURE: true, ALLOWED_ORIGINS: ['https://admin.example.test'] }, db); await production.ready();
    try { const csrf = await production.inject('/api/admin/auth/csrf'); expect(csrf.cookies.every(cookie => cookie.secure && cookie.httpOnly)).toBe(true); expect((await production.inject('/api/docs')).statusCode).toBe(404); } finally { await production.close(); }
  });
  it('generates OpenAPI from Zod only in development', async () => {
    const development = await buildApp({ ...config, NODE_ENV: 'development' }, db); await development.ready();
    try { const response = await development.inject('/api/docs/json'); expect(response.statusCode).toBe(200); expect(response.json().paths).toHaveProperty('/api/admin/auth/login'); } finally { await development.close(); }
  });
});
describe('every role against real endpoints', () => {
  for(const role of roles) it(`${role}: staff CRUD, audit and account endpoints`, async () => { const {client} = await login(role); const allowed = role==='owner'; const other = await user('viewer'); for (const [path,method,body] of [ ['/users','GET',undefined], ['/users','POST',{email:`${randomUUID()}@example.test`,name:'Test staff',role:'viewer',password:randomToken()}], [`/users/${other.id}`,'PATCH',{name:'Updated test'}], [`/users/${other.id}/reset-password`,'POST',{password:randomToken()}], [`/users/${other.id}/reset-totp`,'POST',{}], [`/users/${other.id}`,'DELETE',undefined] ] as const) { const response = await client.call(path,method,body); expect(response.statusCode).toBe(allowed ? (method==='POST'&&path==='/users'?201:200) : 403); } expect((await client.call('/audit')).statusCode).toBe(can(role,'audit.read')?200:403); expect((await client.call('/auth/sessions')).statusCode).toBe(200); expect((await client.call('/dashboard')).statusCode).toBe(200); },20000);
  it('revokes sessions when roles or activation change', async () => { const owner = await login('owner'); const staff = await login('editor'); expect((await owner.client.call(`/users/${staff.account.id}`,'PATCH',{role:'viewer'})).statusCode).toBe(200); expect((await staff.client.call('/dashboard')).statusCode).toBe(401); });
  it('keeps the final active owner', async () => { const owner = await login('owner'); await db.user.updateMany({where:{role:'owner',id:{not:owner.account.id}},data:{isActive:false}}); expect((await owner.client.call(`/users/${owner.account.id}`,'DELETE')).statusCode).toBe(409); expect((await owner.client.call(`/users/${owner.account.id}`,'PATCH',{role:'manager'})).statusCode).toBe(409); });
});
describe('TOTP and audit', () => {
  it('enrolls, verifies and encrypts TOTP, rejects token reuse', async () => { const {client,account} = await login('manager'); const response = await client.call('/auth/totp/enroll','POST',{password}); expect(response.statusCode).toBe(200); const secret=response.json().secret; const stored=await db.user.findUniqueOrThrow({where:{id:account.id}}); expect(stored.totpPendingSecret).not.toContain(secret); const totp=makeTotp(account.email,secret); const code=totp.generate(); expect((await client.call('/auth/totp/verify','POST',{code})).statusCode).toBe(200); await client.call('/auth/logout','POST',{}); await client.call('/auth/csrf'); expect((await client.call('/auth/login','POST',{email:account.email,password,code})).statusCode).toBe(401); });
  it('requires TOTP when enabled and allows a fresh token', async () => { const totp=makeTotp('test@example.test'); const account=await user('manager',{totpSecret:encryptSecret(totp.secret.base32,config)}); const client=browser(); await client.call('/auth/csrf'); expect((await client.call('/auth/login','POST',{email:account.email,password})).statusCode).toBe(401); expect((await client.call('/auth/login','POST',{email:account.email,password,code:totp.generate()})).statusCode).toBe(200); });
  it('writes audit entries without credentials or raw IP addresses', async () => { const rows=await db.auditLog.findMany(); const actions=rows.map(row=>row.action); for(const action of ['auth.login','auth.login_failed','auth.logout','staff.created','staff.updated','staff.deactivated','staff.password_reset','staff.totp_reset','auth.password_changed','auth.totp_enabled']) expect(actions).toContain(action); for(const row of rows) { expect(row.ip).toMatch(/^[a-f0-9]{64}$/); expect(JSON.stringify(row)).not.toContain(password); expect(JSON.stringify(row)).not.toContain('passwordHash'); expect(JSON.stringify(row)).not.toContain('totpSecret'); } });
  it('prevents audit log edits at the database layer', async () => { const row = await db.auditLog.findFirstOrThrow(); await expect(db.auditLog.delete({where:{id:row.id}})).rejects.toThrow(); });
});
