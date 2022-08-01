-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "visits" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "_likedGames" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_dislikedGames" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_likedGames_AB_unique" ON "_likedGames"("A", "B");

-- CreateIndex
CREATE INDEX "_likedGames_B_index" ON "_likedGames"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_dislikedGames_AB_unique" ON "_dislikedGames"("A", "B");

-- CreateIndex
CREATE INDEX "_dislikedGames_B_index" ON "_dislikedGames"("B");

-- AddForeignKey
ALTER TABLE "_likedGames" ADD CONSTRAINT "_likedGames_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_likedGames" ADD CONSTRAINT "_likedGames_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_dislikedGames" ADD CONSTRAINT "_dislikedGames_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_dislikedGames" ADD CONSTRAINT "_dislikedGames_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
