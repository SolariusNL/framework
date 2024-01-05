-- CreateTable
CREATE TABLE "Decal" (
    "id" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL DEFAULT '',
    "price" INTEGER NOT NULL DEFAULT 0,
    "priceBits" INTEGER NOT NULL DEFAULT 0,
    "onSale" BOOLEAN NOT NULL DEFAULT false,
    "limited" BOOLEAN NOT NULL DEFAULT false,
    "canAuthorEdit" BOOLEAN NOT NULL DEFAULT true,
    "previewUri" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Decal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecalKeyValuePair" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "DecalKeyValuePair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_userStarredDecals" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_userDecals" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_userStarredDecals_AB_unique" ON "_userStarredDecals"("A", "B");

-- CreateIndex
CREATE INDEX "_userStarredDecals_B_index" ON "_userStarredDecals"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_userDecals_AB_unique" ON "_userDecals"("A", "B");

-- CreateIndex
CREATE INDEX "_userDecals_B_index" ON "_userDecals"("B");

-- AddForeignKey
ALTER TABLE "Decal" ADD CONSTRAINT "Decal_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecalKeyValuePair" ADD CONSTRAINT "DecalKeyValuePair_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Decal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userStarredDecals" ADD CONSTRAINT "_userStarredDecals_A_fkey" FOREIGN KEY ("A") REFERENCES "Decal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userStarredDecals" ADD CONSTRAINT "_userStarredDecals_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userDecals" ADD CONSTRAINT "_userDecals_A_fkey" FOREIGN KEY ("A") REFERENCES "Decal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userDecals" ADD CONSTRAINT "_userDecals_B_fkey" FOREIGN KEY ("B") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
