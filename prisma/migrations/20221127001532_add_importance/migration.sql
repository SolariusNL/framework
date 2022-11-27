/*
  Warnings:

  - Added the required column `importance` to the `AdminActivityLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdminActivityLog" ADD COLUMN     "importance" INTEGER NOT NULL;
