-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailResetRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passwordResetRequired" BOOLEAN NOT NULL DEFAULT false;
