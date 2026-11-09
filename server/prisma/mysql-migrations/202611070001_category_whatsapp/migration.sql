ALTER TABLE `CatalogCategory`
  ADD COLUMN `whatsapp` VARCHAR(16) NULL;

UPDATE `CatalogCategory`
SET `whatsapp` = '967771000511'
WHERE `slug` = 'accessories';
