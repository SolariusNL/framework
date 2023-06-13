-- CreateEnum
CREATE TYPE "CatalogItemType" AS ENUM ('HAT', 'SHIRT', 'PANTS', 'TSHIRT', 'GEAR');

-- CreateTable
CREATE TABLE "CatalogItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "priceBits" INTEGER NOT NULL,
    "type" "CatalogItemType" NOT NULL,
    "previewUri" TEXT NOT NULL,
    "onSale" BOOLEAN NOT NULL DEFAULT true,
    "limited" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LimitedCatalogItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "type" "CatalogItemType" NOT NULL,
    "previewUri" TEXT NOT NULL,
    "limited" BOOLEAN NOT NULL DEFAULT true,
    "onSale" BOOLEAN NOT NULL DEFAULT true,
    "stock" INTEGER NOT NULL,
    "recentAveragePrice" INTEGER NOT NULL,
    "rapLastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LimitedCatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LimitedCatalogItemReceipt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemId" TEXT NOT NULL,
    "salePrice" INTEGER NOT NULL,
    "buyerId" INTEGER NOT NULL,

    CONSTRAINT "LimitedCatalogItemReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_starredCatalogItems" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_starredLimitedCatalogItems" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_starredCatalogItems_AB_unique" ON "_starredCatalogItems"("A", "B");

-- CreateIndex
CREATE INDEX "_starredCatalogItems_B_index" ON "_starredCatalogItems"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_starredLimitedCatalogItems_AB_unique" ON "_starredLimitedCatalogItems"("A", "B");

-- CreateIndex
CREATE INDEX "_starredLimitedCatalogItems_B_index" ON "_starredLimitedCatalogItems"("B");

-- AddForeignKey
ALTER TABLE "LimitedCatalogItemReceipt" ADD CONSTRAINT "LimitedCatalogItemReceipt_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "LimitedCatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LimitedCatalogItemReceipt" ADD CONSTRAINT "LimitedCatalogItemReceipt_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_starredCatalogItems" ADD CONSTRAINT "_starredCatalogItems_A_fkey" FOREIGN KEY ("A") REFERENCES "CatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_starredCatalogItems" ADD CONSTRAINT "_starredCatalogItems_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_starredLimitedCatalogItems" ADD CONSTRAINT "_starredLimitedCatalogItems_A_fkey" FOREIGN KEY ("A") REFERENCES "LimitedCatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_starredLimitedCatalogItems" ADD CONSTRAINT "_starredLimitedCatalogItems_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
