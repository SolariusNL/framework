-- CreateEnum
CREATE TYPE "TeamStaffPermission" AS ENUM ('EDIT_SHOUT', 'EDIT_PRIVACY', 'EDIT_MEMBERS', 'EDIT_ISSUES');

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "staffPermissions" "TeamStaffPermission"[];
