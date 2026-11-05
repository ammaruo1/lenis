/**
 * Local preview on :53000 with built SPA; /api/* proxied to live store (cloud DB on Hostinger).
 * Use when remote MySQL from this PC is blocked (Hostinger Remote MySQL IP allowlist).
 */
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';

const UPSTREAM = (process.env.CLOUD_API_ORIGIN || 'https://alarabiye.com').replace(/\/$/, '');
const UPSTREAM_ORIGIN = new URL(UPSTREAM).origin;

/** Production Set-Cookie uses Secure + Domain; rewrite so admin login works on http://127.0.0.1 */
function rewriteSetCookieHeader(value) {
  return value
    .split(/,(?=\s*[\w-]+=)/)
    .map(part =>
      part
        .replace(/;\s*Domain=[^;]*/gi, '')
        .replace(/;\s*Secure/gi, '')
        .replace(/;\s*SameSite=None/gi, '; SameSite=Lax')
        .trim()
    )
    .join(', ');
}
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../../dist');
const adminRoot = join(here, '../../admin/dist');

if (!existsSync(join(root, 'index.html')) || !existsSync(join(adminRoot, 'index.html'))) {
  throw new Error('Run npm run build:all first.');
}

const app = Fastify({ logger: { level: 'info' }, bodyLimit: 32 * 1024 * 1024 });

async function readBody(request) {
  if (request.method === 'GET' || request.method === 'HEAD') return undefined;
  if (request.body !== undefined && request.body !== null) {
    return Buffer.from(typeof request.body === 'string' ? request.body : JSON.stringify(request.body));
  }
  const chunks = [];
  for await (const chunk of request.raw) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function proxyRequest(request, reply) {
  const upstream = `${UPSTREAM}${request.url}`;
  const headers = {};
  for (const [key, val] of Object.entries(request.headers)) {
    const lower = key.toLowerCase();
    if (['host', 'connection', 'content-length', 'accept-encoding'].includes(lower)) continue;
    if (val !== undefined) headers[key] = Array.isArray(val) ? val.join(', ') : val;
  }
  headers['accept-encoding'] = 'identity';
  // Production CSRF allows only ALLOWED_ORIGINS (alarabiye.com), not localhost.
  if (request.url.startsWith('/api/admin')) {
    headers.origin = UPSTREAM_ORIGIN;
    headers.referer = `${UPSTREAM_ORIGIN}/admin/`;
  }

  const body = await readBody(request);
  const res = await fetch(upstream, { method: request.method, headers, body, redirect: 'manual' });

  reply.code(res.status);
  const setCookies = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
  for (const [key, val] of res.headers.entries()) {
    const lower = key.toLowerCase();
    if (['transfer-encoding', 'connection', 'content-encoding', 'content-length', 'set-cookie'].includes(lower)) continue;
    reply.header(key, val);
  }
  if (setCookies.length) {
    for (const cookie of setCookies) reply.header('set-cookie', rewriteSetCookieHeader(cookie));
  } else {
    const single = res.headers.get('set-cookie');
    if (single) reply.header('set-cookie', rewriteSetCookieHeader(single));
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return reply.send(buf);
}

app.all('/api/*', proxyRequest);
app.get('/sitemap.xml', proxyRequest);

await app.register(fastifyStatic, { root, prefix: '/', decorateReply: true });
await app.register(fastifyStatic, { root: adminRoot, prefix: '/admin/', decorateReply: false });

app.get('/', async (_request, reply) => reply.redirect('/ar', 302));
app.get('/admin', async (_request, reply) => reply.redirect('/admin/'));

app.setNotFoundHandler(async (request, reply) => {
  const path = request.url.split('?')[0];
  if (
    ['GET', 'HEAD'].includes(request.method) &&
    !path.startsWith('/api') &&
    !path.split('/').pop()?.includes('.')
  ) {
    if (path.startsWith('/admin/') || path === '/admin') {
      return reply.type('text/html').sendFile('index.html', adminRoot);
    }
    return reply.type('text/html').sendFile('index.html', root);
  }
  return reply.code(404).send({ error: { code: 'not_found' } });
});

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 53000);
await app.listen({ host, port });
console.log(`Cloud API proxy → ${UPSTREAM} | UI → http://${host}:${port}/ar/shop`);
