-- AlterTable
ALTER TABLE "CatalogItem" ADD COLUMN     "quantitySold" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "LimitedCatalogItem" ADD COLUMN     "quantitySold" INTEGER NOT NULL DEFAULT 0;
