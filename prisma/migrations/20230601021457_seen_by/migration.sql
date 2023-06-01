/*
  Warnings:

  - You are about to drop the column `seen` on the `ChatMessage` table. All the data in the column will be lost.
  - You are about to drop the column `read` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "seen";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "read";

-- CreateTable
CREATE TABLE "_readMessages" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_readMessages_AB_unique" ON "_readMessages"("A", "B");

-- CreateIndex
CREATE INDEX "_readMessages_B_index" ON "_readMessages"("B");

-- AddForeignKey
ALTER TABLE "_readMessages" ADD CONSTRAINT "_readMessages_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_readMessages" ADD CONSTRAINT "_readMessages_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
