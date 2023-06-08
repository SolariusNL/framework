-- AlterTable
ALTER TABLE "Sound" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 0;
