import Fastify, { type FastifyError } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { validatorCompiler, serializerCompiler, jsonSchemaTransform } from '@fastify/type-provider-zod';
import { Prisma, type PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { can, EmptySchema } from '@aljeel/shared';
import type { AppConfig } from './config.js';
import { ApiError } from './errors.js';
import { hashToken, safeEqual } from './security.js';
import { authRoutes } from './routes-auth.js';
import { staffRoutes } from './routes-staff.js';
import './auth-context.js';

export async function buildApp(config: AppConfig, db: PrismaClient, options: { disableRateLimits?: boolean } = {}) {
  const app = Fastify({ bodyLimit: 32 * 1024, trustProxy: config.TRUST_PROXY, logger: config.LOG_LEVEL === 'silent' ? false : {
    level: config.LOG_LEVEL, redact: ['req.headers.cookie', 'req.headers.authorization', 'req.headers["x-csrf-token"]', 'res.headers["set-cookie"]'],
    serializers: { req: request => ({ id: request.id, method: request.method, path: request.url?.split('?')[0] }), res: reply => ({ statusCode: reply.statusCode }) },
  } });
  app.decorateRequest('auth', null);
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await app.register(cookie, { secret: config.SESSION_SECRET });
  await app.register(helmet, { global: true, hsts: config.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false, contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } } });
  await app.register(cors, { credentials: true, origin: (origin, callback) => callback(null, !origin || config.ALLOWED_ORIGINS.includes(origin)), methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'X-CSRF-Token'] });
  await app.register(rateLimit, { global: !options.disableRateLimits, max: 120, timeWindow: '1 minute', errorResponseBuilder: () => ({ statusCode: 429, error: { code: 'rate_limited' } }) });
  if (config.NODE_ENV === 'development') {
    await app.register(swagger, { openapi: { info: { title: 'Al-Jeel Admin API', version: '0.1.0' } }, transform: jsonSchemaTransform });
    await app.register(swaggerUi, { routePrefix: '/api/docs', staticCSP: true });
  }
  app.setErrorHandler<FastifyError>((error, request, reply) => {
    if (error instanceof ApiError) return reply.code(error.statusCode).send({ error: { code: error.code } });
    if (error instanceof z.ZodError || error.validation) return reply.code(400).send({ error: { code: 'validation_failed' } });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return reply.code(409).send({ error: { code: 'already_exists' } });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return reply.code(404).send({ error: { code: 'not_found' } });
    if (error.statusCode && error.statusCode < 500) return reply.code(error.statusCode).send({ error: { code: error.statusCode === 429 ? 'rate_limited' : 'request_failed' } });
    request.log.error({ name: error.name, requestId: request.id }, 'Request failed');
    return reply.code(500).send({ error: { code: 'server_error' } });
  });
  app.setNotFoundHandler((_request, reply) => reply.code(404).send({ error: { code: 'not_found' } }));
  app.get('/api/health', { schema: { querystring: EmptySchema } }, async (_request, reply) => {
    try { await db.$queryRaw`SELECT 1`; return { status: 'ok' }; }
    catch { return reply.code(503).send({ status: 'unavailable' }); }
  });
  await app.register(async admin => {
    admin.addHook('onRequest', async (request, reply) => {
      reply.header('Cache-Control', 'no-store').header('X-Robots-Tag', 'noindex, nofollow');
      const route = request.routeOptions.config;
      if (!route.public) {
        const raw = request.cookies.aljeel_session;
        if (!raw) throw new ApiError(401, 'unauthenticated');
        const session = await db.session.findUnique({ where: { id: hashToken(raw) }, include: { user: true } });
        const now = Date.now();
        if (!session || !session.user.isActive || session.expiresAt.getTime() <= now || session.lastSeenAt.getTime() + config.SESSION_IDLE_MINUTES * 60000 <= now || (session.user.lockedUntil && session.user.lockedUntil.getTime() > now)) {
          if (session) await db.session.deleteMany({ where: { id: session.id } });
          throw new ApiError(401, 'unauthenticated');
        }
        request.auth = { session, user: session.user };
        if (session.user.mustChangePassword && !route.allowPasswordChange) throw new ApiError(403, 'password_change_required');
        if (config.REQUIRE_OWNER_2FA && session.user.role === 'owner' && !session.user.totpSecret && !route.allowPasswordChange) throw new ApiError(403, 'totp_required');
        if (route.permission && !can(session.user.role, route.permission)) throw new ApiError(403, 'forbidden');
        if (now - session.lastSeenAt.getTime() > 60000) await db.session.updateMany({ where: { id: session.id }, data: { lastSeenAt: new Date() } });
      }
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        const origin = request.headers.origin;
        const header = request.headers['x-csrf-token'];
        const signed = request.cookies.aljeel_csrf;
        const unsigned = signed ? request.unsignCookie(signed) : null;
        if (!origin || !config.ALLOWED_ORIGINS.includes(origin) || typeof header !== 'string' || !unsigned?.valid || !unsigned.value || !safeEqual(header, unsigned.value)) throw new ApiError(403, 'csrf_invalid');
      }
    });
    await authRoutes(admin, db, config, options.disableRateLimits ?? false);
    await staffRoutes(admin, db, config);
    admin.get('/dashboard', { schema: { querystring: EmptySchema } }, async () => ({ phase: 'A', message: 'dashboard_pending', hasBusinessData: false }));
  }, { prefix: '/api/admin' });
  return app;
}
