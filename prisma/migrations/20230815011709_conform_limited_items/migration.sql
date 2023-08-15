-- AlterTable
ALTER TABLE "LimitedCatalogItem" ADD COLUMN     "authorId" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "LimitedCatalogItemKeyValuePair" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "LimitedCatalogItemKeyValuePair_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LimitedCatalogItem" ADD CONSTRAINT "LimitedCatalogItem_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LimitedCatalogItemKeyValuePair" ADD CONSTRAINT "LimitedCatalogItemKeyValuePair_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "LimitedCatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
