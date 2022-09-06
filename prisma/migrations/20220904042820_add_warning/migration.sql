-- AlterTable
ALTER TABLE "User" ADD COLUMN     "warning" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "warningViewed" BOOLEAN NOT NULL DEFAULT false;
