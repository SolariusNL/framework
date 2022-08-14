-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT NOT NULL DEFAULT 'This user has not yet written a bio.',
ADD COLUMN     "busy" BOOLEAN NOT NULL DEFAULT false;
