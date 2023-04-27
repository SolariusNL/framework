/*
  Warnings:

  - Added the required column `contentMd` to the `SupportTicket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SupportTicket" ADD COLUMN     "contentMd" TEXT NOT NULL;
