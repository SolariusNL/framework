-- CreateEnum
CREATE TYPE "GameUpdateLogType" AS ENUM ('PATCH', 'MINOR', 'MAJOR');

-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "paywallPrice" SET DEFAULT 1;

-- CreateTable
CREATE TABLE "GameUpdateLog" (
    "id" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "type" "GameUpdateLogType" NOT NULL,

    CONSTRAINT "GameUpdateLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_gameFollowers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_gameFollowers_AB_unique" ON "_gameFollowers"("A", "B");

-- CreateIndex
CREATE INDEX "_gameFollowers_B_index" ON "_gameFollowers"("B");

-- AddForeignKey
ALTER TABLE "GameUpdateLog" ADD CONSTRAINT "GameUpdateLog_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_gameFollowers" ADD CONSTRAINT "_gameFollowers_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_gameFollowers" ADD CONSTRAINT "_gameFollowers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
