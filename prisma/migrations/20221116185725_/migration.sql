/*
  Warnings:

  - Added the required column `alias` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "alias" TEXT NOT NULL,
ADD COLUMN     "previousUsernames" TEXT[];
