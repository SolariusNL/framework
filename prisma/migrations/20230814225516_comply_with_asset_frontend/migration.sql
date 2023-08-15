-- AlterTable
ALTER TABLE "Sound" ADD COLUMN     "limited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onSale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "priceBits" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SoundKeyValuePair" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SoundKeyValuePair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogItemKeyValuePair" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "CatalogItemKeyValuePair_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SoundKeyValuePair" ADD CONSTRAINT "SoundKeyValuePair_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Sound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogItemKeyValuePair" ADD CONSTRAINT "CatalogItemKeyValuePair_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
