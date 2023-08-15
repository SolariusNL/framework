-- AlterTable
ALTER TABLE "CatalogItem" ADD COLUMN     "authorId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "CatalogItem" ADD CONSTRAINT "CatalogItem_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
