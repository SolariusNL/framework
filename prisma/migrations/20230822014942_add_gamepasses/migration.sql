/*
  Warnings:

  - You are about to drop the column `totalRevenue` on the `Gamepass` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `Gamepass` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previewUri` to the `Gamepass` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_userGamepasses" DROP CONSTRAINT "_userGamepasses_B_fkey";

-- AlterTable
ALTER TABLE "CatalogItem" ADD COLUMN     "canAuthorEdit" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Gamepass" DROP COLUMN "totalRevenue",
ADD COLUMN     "authorId" INTEGER NOT NULL,
ADD COLUMN     "limited" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onSale" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "previewUri" TEXT NOT NULL,
ADD COLUMN     "priceBits" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "LimitedCatalogItem" ADD COLUMN     "canAuthorEdit" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Sound" ADD COLUMN     "canAuthorEdit" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "_userGamepasses" ALTER COLUMN "B" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "GamepassKeyValuePair" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "GamepassKeyValuePair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_userStarredGamepasses" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_userStarredGamepasses_AB_unique" ON "_userStarredGamepasses"("A", "B");

-- CreateIndex
CREATE INDEX "_userStarredGamepasses_B_index" ON "_userStarredGamepasses"("B");

-- AddForeignKey
ALTER TABLE "Gamepass" ADD CONSTRAINT "Gamepass_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamepassKeyValuePair" ADD CONSTRAINT "GamepassKeyValuePair_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Gamepass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userStarredGamepasses" ADD CONSTRAINT "_userStarredGamepasses_A_fkey" FOREIGN KEY ("A") REFERENCES "Gamepass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userStarredGamepasses" ADD CONSTRAINT "_userStarredGamepasses_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userGamepasses" ADD CONSTRAINT "_userGamepasses_B_fkey" FOREIGN KEY ("B") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
