import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
export function createDb(url: string): PrismaClient {
  const parsed = new URL(url);
  const schema = parsed.searchParams.get('schema') ?? 'public';
  parsed.searchParams.delete('schema');
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: parsed.toString() }, { schema }) });
}
export async function transaction<T>(db: PrismaClient, operation: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try { return await db.$transaction(operation, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }); }
    catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034' && attempt < 3) continue;
      throw error;
    }
  }
}
