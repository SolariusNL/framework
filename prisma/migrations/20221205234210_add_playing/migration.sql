-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gameId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
