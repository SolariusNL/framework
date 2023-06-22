/*
  Warnings:

  - A unique constraint covering the columns `[associatedLoginId]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "NewLogin" ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "associatedLoginId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Session_associatedLoginId_key" ON "Session"("associatedLoginId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_associatedLoginId_fkey" FOREIGN KEY ("associatedLoginId") REFERENCES "NewLogin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
