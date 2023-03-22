/*
  Warnings:

  - The values [UPDAT_PRIVACY_STATUS] on the enum `TeamAuditLogType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TeamAuditLogType_new" AS ENUM ('UPDATE_TEAM_DETAILS', 'UPDATE_PRIVACY_STATUS', 'UPDATE_INVITED_USERS', 'UPDATE_SHOUT', 'REMOVE_USER');
ALTER TABLE "TeamAuditLog" ALTER COLUMN "type" TYPE "TeamAuditLogType_new" USING ("type"::text::"TeamAuditLogType_new");
ALTER TYPE "TeamAuditLogType" RENAME TO "TeamAuditLogType_old";
ALTER TYPE "TeamAuditLogType_new" RENAME TO "TeamAuditLogType";
DROP TYPE "TeamAuditLogType_old";
COMMIT;
