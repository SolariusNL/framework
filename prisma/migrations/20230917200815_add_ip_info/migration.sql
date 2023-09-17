-- AlterTable
ALTER TABLE "User" ADD COLUMN     "recentIp" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "recentIpGeo" JSONB NOT NULL DEFAULT '{}';
