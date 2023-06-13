-- CreateTable
CREATE TABLE "LimitedCatalogItemResell" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemId" TEXT NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "LimitedCatalogItemResell_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LimitedCatalogItemResell" ADD CONSTRAINT "LimitedCatalogItemResell_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "LimitedCatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LimitedCatalogItemResell" ADD CONSTRAINT "LimitedCatalogItemResell_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
