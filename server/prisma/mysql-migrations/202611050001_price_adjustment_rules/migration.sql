-- Price adjustment rules: snapshot before bulk changes for undo
CREATE TABLE IF NOT EXISTS `PriceAdjustmentRule` (
  `id` VARCHAR(100) NOT NULL,
  `action` VARCHAR(40) NOT NULL,
  `summary` VARCHAR(500) NOT NULL,
  `params` JSON NOT NULL,
  `items` JSON NOT NULL,
  `itemCount` INT NOT NULL,
  `revertedAt` DATETIME(3) NULL,
  `createdBy` VARCHAR(100) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `PriceAdjustmentRule_createdAt_idx` (`createdAt`),
  INDEX `PriceAdjustmentRule_revertedAt_idx` (`revertedAt`),
  CONSTRAINT `PriceAdjustmentRule_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
