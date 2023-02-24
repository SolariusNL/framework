-- AlterTable
ALTER TABLE "User" ADD COLUMN     "newsletterEmail" TEXT,
ADD COLUMN     "newsletterSubscribed" BOOLEAN NOT NULL DEFAULT false;
