-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "paywall" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "_purchasedGames" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_purchasedGames_AB_unique" ON "_purchasedGames"("A", "B");

-- CreateIndex
CREATE INDEX "_purchasedGames_B_index" ON "_purchasedGames"("B");

-- AddForeignKey
ALTER TABLE "_purchasedGames" ADD CONSTRAINT "_purchasedGames_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_purchasedGames" ADD CONSTRAINT "_purchasedGames_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
