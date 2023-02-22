-- CreateEnum
CREATE TYPE "TeamAccess" AS ENUM ('OPEN', 'PRIVATE');

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "access" "TeamAccess" NOT NULL DEFAULT 'OPEN';

-- CreateTable
CREATE TABLE "_teamInvites" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_teamInvites_AB_unique" ON "_teamInvites"("A", "B");

-- CreateIndex
CREATE INDEX "_teamInvites_B_index" ON "_teamInvites"("B");

-- AddForeignKey
ALTER TABLE "_teamInvites" ADD CONSTRAINT "_teamInvites_A_fkey" FOREIGN KEY ("A") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_teamInvites" ADD CONSTRAINT "_teamInvites_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
