-- AlterTable
ALTER TABLE "LimitedCatalogItem" ADD COLUMN     "originalPrice" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "originalStock" INTEGER NOT NULL DEFAULT 0;
