/*
  Warnings:

  - Added the required column `connectionId` to the `NucleusKey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NucleusKey" ADD COLUMN     "connectionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "NucleusKey" ADD CONSTRAINT "NucleusKey_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "Connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
