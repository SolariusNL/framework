/*
  Warnings:

  - Made the column `userId` on table `PasswordResetRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PasswordResetRequest" DROP CONSTRAINT "PasswordResetRequest_userId_fkey";

-- DropIndex
DROP INDEX "PasswordResetRequest_userId_key";

-- AlterTable
ALTER TABLE "PasswordResetRequest" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "PasswordResetRequest" ADD CONSTRAINT "PasswordResetRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
