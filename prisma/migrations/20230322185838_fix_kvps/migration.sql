/*
  Warnings:

  - Added the required column `key` to the `TeamAuditLogKeyValuePair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `TeamAuditLogKeyValuePair` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TeamAuditLogKeyValuePair" ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL;
