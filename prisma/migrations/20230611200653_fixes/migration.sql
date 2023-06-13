/*
  Warnings:

  - You are about to drop the `_limitedCatalogItems` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_limitedCatalogItems" DROP CONSTRAINT "_limitedCatalogItems_A_fkey";

-- DropForeignKey
ALTER TABLE "_limitedCatalogItems" DROP CONSTRAINT "_limitedCatalogItems_B_fkey";

-- DropTable
DROP TABLE "_limitedCatalogItems";

-- CreateTable
CREATE TABLE "LimitedInventoryItem" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "LimitedInventoryItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LimitedInventoryItem" ADD CONSTRAINT "LimitedInventoryItem_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LimitedInventoryItem" ADD CONSTRAINT "LimitedInventoryItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "LimitedCatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
