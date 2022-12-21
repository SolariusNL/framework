-- CreateEnum
CREATE TYPE "AdminPermission" AS ENUM ('WRITE_ARTICLE', 'PUNISH_USERS', 'RUN_ACTIONS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminPermissions" "AdminPermission"[];
