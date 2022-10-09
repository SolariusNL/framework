-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_gameId_fkey";

-- AlterTable
ALTER TABLE "Rating" ALTER COLUMN "gameId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
