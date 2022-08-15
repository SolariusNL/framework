-- AlterTable
ALTER TABLE "User" ADD COLUMN     "banReason" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false;
