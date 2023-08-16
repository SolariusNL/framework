/*
  Warnings:

  - You are about to drop the column `serial` on the `LimitedCatalogItemResell` table. All the data in the column will be lost.
  - You are about to drop the column `serial` on the `LimitedInventoryItem` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "LimitedCatalogItemResell_serial_key";

-- DropIndex
DROP INDEX "LimitedInventoryItem_serial_key";

-- AlterTable
ALTER TABLE "LimitedCatalogItemResell" DROP COLUMN "serial";

-- AlterTable
ALTER TABLE "LimitedInventoryItem" DROP COLUMN "serial";
