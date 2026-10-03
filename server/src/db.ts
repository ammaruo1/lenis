import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
export function createDb(url: string): PrismaClient {
  const parsed = new URL(url);
  if (parsed.protocol !== 'mysql:') throw new Error('MySQL DATABASE_URL is required');
  return new PrismaClient({ adapter: new PrismaMariaDb({ host: parsed.hostname, port: Number(parsed.port || 3306), user: decodeURIComponent(parsed.username), password: decodeURIComponent(parsed.password), database: decodeURIComponent(parsed.pathname.slice(1)), connectionLimit: 5, timezone: '+00:00', connectTimeout: 10000, ...(parsed.searchParams.get('ssl') === 'true' ? { ssl: true } : {}),...(['127.0.0.1','localhost'].includes(parsed.hostname)?{allowPublicKeyRetrieval:true}:{}) }) });
}
export async function transaction<T>(db: PrismaClient, operation: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try { return await db.$transaction(operation, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable,timeout:30000,maxWait:10000 }); }
    catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034' && attempt < 3) continue;
      throw error;
    }
  }
}
