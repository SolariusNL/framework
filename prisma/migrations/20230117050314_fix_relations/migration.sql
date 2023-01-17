/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Referral` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Referral" DROP CONSTRAINT "Referral_userId_fkey";

-- AlterTable
ALTER TABLE "Referral" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referralId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Referral_userId_key" ON "Referral"("userId");

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
