/*
  Warnings:

  - Added the required column `subject` to the `EmailReceipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to` to the `EmailReceipt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailReceipt" ADD COLUMN     "subject" TEXT NOT NULL,
ADD COLUMN     "to" TEXT NOT NULL;
