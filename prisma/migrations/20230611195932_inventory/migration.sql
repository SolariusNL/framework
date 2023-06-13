/*
  Warnings:

  - You are about to drop the `_ownedCatalogItems` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ownedLimitedCatalogItems` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ownedCatalogItems" DROP CONSTRAINT "_ownedCatalogItems_A_fkey";

-- DropForeignKey
ALTER TABLE "_ownedCatalogItems" DROP CONSTRAINT "_ownedCatalogItems_B_fkey";

-- DropForeignKey
ALTER TABLE "_ownedLimitedCatalogItems" DROP CONSTRAINT "_ownedLimitedCatalogItems_A_fkey";

-- DropForeignKey
ALTER TABLE "_ownedLimitedCatalogItems" DROP CONSTRAINT "_ownedLimitedCatalogItems_B_fkey";

-- DropTable
DROP TABLE "_ownedCatalogItems";

-- DropTable
DROP TABLE "_ownedLimitedCatalogItems";

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_standardCatalogItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_limitedCatalogItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_userId_key" ON "Inventory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_standardCatalogItems_AB_unique" ON "_standardCatalogItems"("A", "B");

-- CreateIndex
CREATE INDEX "_standardCatalogItems_B_index" ON "_standardCatalogItems"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_limitedCatalogItems_AB_unique" ON "_limitedCatalogItems"("A", "B");

-- CreateIndex
CREATE INDEX "_limitedCatalogItems_B_index" ON "_limitedCatalogItems"("B");

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_standardCatalogItems" ADD CONSTRAINT "_standardCatalogItems_A_fkey" FOREIGN KEY ("A") REFERENCES "CatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_standardCatalogItems" ADD CONSTRAINT "_standardCatalogItems_B_fkey" FOREIGN KEY ("B") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_limitedCatalogItems" ADD CONSTRAINT "_limitedCatalogItems_A_fkey" FOREIGN KEY ("A") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_limitedCatalogItems" ADD CONSTRAINT "_limitedCatalogItems_B_fkey" FOREIGN KEY ("B") REFERENCES "LimitedCatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
