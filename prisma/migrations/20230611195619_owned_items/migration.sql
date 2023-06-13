-- CreateTable
CREATE TABLE "_ownedCatalogItems" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ownedLimitedCatalogItems" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ownedCatalogItems_AB_unique" ON "_ownedCatalogItems"("A", "B");

-- CreateIndex
CREATE INDEX "_ownedCatalogItems_B_index" ON "_ownedCatalogItems"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ownedLimitedCatalogItems_AB_unique" ON "_ownedLimitedCatalogItems"("A", "B");

-- CreateIndex
CREATE INDEX "_ownedLimitedCatalogItems_B_index" ON "_ownedLimitedCatalogItems"("B");

-- AddForeignKey
ALTER TABLE "_ownedCatalogItems" ADD CONSTRAINT "_ownedCatalogItems_A_fkey" FOREIGN KEY ("A") REFERENCES "CatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ownedCatalogItems" ADD CONSTRAINT "_ownedCatalogItems_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ownedLimitedCatalogItems" ADD CONSTRAINT "_ownedLimitedCatalogItems_A_fkey" FOREIGN KEY ("A") REFERENCES "LimitedCatalogItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ownedLimitedCatalogItems" ADD CONSTRAINT "_ownedLimitedCatalogItems_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
