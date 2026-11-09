import { describe, it, expect } from 'vitest';
import { can, roles, permissions, permissionTable, PasswordSchema, StaffCreateSchema, ProductSchema, normalizeSearch, CategoryEdit } from '@aljeel/shared';
import { ConfigSchema } from '../src/config.js';
import { encryptSecret, decryptSecret, hashPassword, verifyPassword, hashToken, randomToken, makeTotp, totpCounter } from '../src/security.js';
import { whatsappPhoneForCategory, whatsappPhoneForItems } from '../../src/data/whatsapp.js';
import { readFileSync } from 'node:fs';
const config = ConfigSchema.parse({ DATABASE_URL: 'mysql://localhost/unit_test', SESSION_SECRET: randomToken(), TOTP_ENCRYPTION_KEY: 'a'.repeat(64), ALLOWED_ORIGINS: 'http://localhost:5174', LOG_LEVEL: 'silent' });
const expected = {
  owner: permissions,
  manager: ['settings.manage','catalog.edit','catalog.publish','prices.edit','inventory.manage','orders.manage','customers.manage','crm.read','crm.edit','customers.erase','subscribers.read','subscribers.export','analytics.read','analytics.limited','audit.read','contest.manage'],
  sales: ['prices.edit','orders.manage','crm.read','crm.edit','subscribers.read','analytics.limited','contest.manage'],
  editor: ['catalog.edit','catalog.publish'],
  viewer: ['crm.read','analytics.read'],
};
describe('server permission matrix', () => {
  for (const role of roles) for (const permission of permissions) it(`${role}: ${permission}`, () => expect(can(role, permission)).toBe((expected[role] as readonly string[]).includes(permission)));
  it('all roles have explicit permissions', () => expect(Object.keys(permissionTable)).toEqual([...roles]));
});
describe('shared validation and security primitives', () => {
  it('preserves the existing catalog schema and all current data', () => {
    const products = JSON.parse(readFileSync(new URL('../../src/data/products.json', import.meta.url), 'utf8'));
    for (const product of products) expect(ProductSchema.safeParse(product).success).toBe(true);
  });
  it.each(['short', 'Password123456!', 'aaaaaaaaaaaaaaa', 'qwerty12345678'])('rejects weak password %s', value => expect(PasswordSchema.safeParse(value).success).toBe(false));
  it('normalizes email and forbids unrecognized staff fields', () => {
    expect(StaffCreateSchema.parse({ name: 'Test', email: ' Test@Example.COM ', password: randomToken(), role: 'viewer' }).email).toBe('test@example.com');
    expect(StaffCreateSchema.safeParse({ name: 'Test', email: 'test@example.com', password: randomToken(), role: 'viewer', isAdmin: true }).success).toBe(false);
  });
  it('uses argon2id and verifies passwords', async () => { const password = randomToken(); const hash = await hashPassword(password); expect(hash).toContain('$argon2id$v=19$m=65536,t=3,p=1$'); expect(await verifyPassword(hash, password)).toBe(true); expect(await verifyPassword(hash, randomToken())).toBe(false); });
  it('encrypts TOTP secrets with authenticated encryption', () => { const secret = makeTotp('test@example.com').secret.base32; const cipher = encryptSecret(secret, config); expect(cipher).not.toContain(secret); expect(decryptSecret(cipher, config)).toBe(secret); const parts = cipher.split('.'); parts[1] = Buffer.alloc(16).toString('base64url'); expect(() => decryptSecret(parts.join('.'), config)).toThrow(); });
  it('checks TOTP tokens', () => { const totp = makeTotp('test@example.com'); const cipher = encryptSecret(totp.secret.base32, config); expect(totpCounter('test@example.com', cipher, totp.generate(), config)).not.toBeNull(); expect(totpCounter('test@example.com', cipher, undefined, config)).toBeNull(); });
  it('hashes session tokens and generates unpredictable tokens', () => { const first = randomToken(); expect(first).not.toEqual(randomToken()); expect(hashToken(first)).toMatch(/^[a-f0-9]{64}$/); expect(hashToken(first)).not.toBe(first); });
  it('normalizes Arabic search variants and diacritics', () => { expect(normalizeSearch(' إِدَارَةٌ ')).toBe(normalizeSearch('اداره')); expect(normalizeSearch('آلِيَّة')).toBe(normalizeSearch('الية')); expect(normalizeSearch('مصطفى')).toBe(normalizeSearch('مصطفي')); });
  it('rejects insecure production settings', () => { expect(ConfigSchema.safeParse({ ...config, NODE_ENV: 'production', COOKIE_SECURE: 'false', TRUST_PROXY: 'false', REQUIRE_OWNER_2FA: 'false', ALLOWED_ORIGINS: 'http://localhost' }).success).toBe(false); });
});
describe('category WhatsApp routing', () => {
  const category = { slug: 'accessories', title: { ar: 'الإكسسوارات' }, description: { ar: 'ملحقات' }, parentSlug: null, productTypeId: null, imageId: null, sort: 0, status: 'published' };
  const categories = [{ slug: 'accessories', whatsapp: '967771000511' }, { slug: 'laptops', whatsapp: null }];
  const general = '967770001044';

  it.each(['771000511', '0771000511', '+967 771 000 511', '٠٧٧١٠٠٠٥١١'])(
    'normalizes local and international number %s', phone => expect(CategoryEdit.parse({ ...category, whatsapp: phone }).whatsapp).toBe('967771000511')
  );
  it('allows an empty override and rejects malformed numbers', () => {
    expect(CategoryEdit.parse({ ...category, whatsapp: '' }).whatsapp).toBeNull();
    expect(CategoryEdit.parse(category).whatsapp).toBeUndefined();
    expect(CategoryEdit.safeParse({ ...category, whatsapp: '12' }).success).toBe(false);
  });
  it('uses the exact category number and falls back to the general number', () => {
    expect(whatsappPhoneForCategory(categories, 'accessories', general)).toBe('967771000511');
    expect(whatsappPhoneForCategory(categories, 'laptops', general)).toBe(general);
  });
  it('routes a single-category cart by category and mixed or legacy carts to the general number', () => {
    expect(whatsappPhoneForItems(categories, ['accessories', 'accessories'], general)).toBe('967771000511');
    expect(whatsappPhoneForItems(categories, ['accessories', 'laptops'], general)).toBe(general);
    expect(whatsappPhoneForItems(categories, ['accessories', undefined], general)).toBe(general);
    expect(whatsappPhoneForItems(categories, [], general)).toBe(general);
  });
});
