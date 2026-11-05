import type { PrismaClient } from '@prisma/client';

/** Idempotent DDL when migrate deploy cannot run from the operator machine (Hostinger remote MySQL). */
export async function ensureRemoteCommerceSchema(db: PrismaClient): Promise<void> {
  await db.$executeRawUnsafe(`
    ALTER TABLE \`ProductVariant\`
      ADD COLUMN IF NOT EXISTS \`availabilityMode\` VARCHAR(30) NOT NULL DEFAULT 'in_stock',
      ADD COLUMN IF NOT EXISTS \`leadTimeDays\` INT NULL
  `);
  await ensurePriceAdjustmentRuleSchema(db);
}

export async function ensurePriceAdjustmentRuleSchema(db: PrismaClient): Promise<void> {
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`PriceAdjustmentRule\` (
      \`id\` VARCHAR(100) NOT NULL,
      \`action\` VARCHAR(40) NOT NULL,
      \`summary\` VARCHAR(500) NOT NULL,
      \`params\` JSON NOT NULL,
      \`items\` JSON NOT NULL,
      \`itemCount\` INT NOT NULL,
      \`revertedAt\` DATETIME(3) NULL,
      \`createdBy\` VARCHAR(100) NOT NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (\`id\`),
      INDEX \`PriceAdjustmentRule_createdAt_idx\` (\`createdAt\`),
      INDEX \`PriceAdjustmentRule_revertedAt_idx\` (\`revertedAt\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  const fkRows = await db.$queryRaw<{ cnt: bigint }[]>`
    SELECT COUNT(*) AS cnt FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'PriceAdjustmentRule'
      AND CONSTRAINT_NAME = 'PriceAdjustmentRule_createdBy_fkey'
  `;
  if (Number(fkRows[0]?.cnt ?? 0) === 0) {
    await db.$executeRawUnsafe(`
      ALTER TABLE \`PriceAdjustmentRule\`
      ADD CONSTRAINT \`PriceAdjustmentRule_createdBy_fkey\`
      FOREIGN KEY (\`createdBy\`) REFERENCES \`User\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
    `).catch(() => {
      /* FK may already exist under another name on partial deploy */
    });
  }
}
