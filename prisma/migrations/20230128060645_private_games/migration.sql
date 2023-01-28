-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "private" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "_privateGameAccess" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_privateGameAccess_AB_unique" ON "_privateGameAccess"("A", "B");

-- CreateIndex
CREATE INDEX "_privateGameAccess_B_index" ON "_privateGameAccess"("B");

-- AddForeignKey
ALTER TABLE "_privateGameAccess" ADD CONSTRAINT "_privateGameAccess_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_privateGameAccess" ADD CONSTRAINT "_privateGameAccess_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
