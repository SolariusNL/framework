-- AlterTable
ALTER TABLE "UserReport" ADD COLUMN     "gameId" INTEGER;

-- AddForeignKey
ALTER TABLE "UserReport" ADD CONSTRAINT "UserReport_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
