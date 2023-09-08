/*
  Warnings:

  - Added the required column `category` to the `AbuseReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `AbuseReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AbuseReport" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL;
