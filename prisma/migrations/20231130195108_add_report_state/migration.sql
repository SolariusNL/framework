-- CreateEnum
CREATE TYPE "UserReportState" AS ENUM ('AWAITING_REVIEW', 'NO_VIOLATIONS', 'VIOLATIONS_FOUND');

-- AlterTable
ALTER TABLE "UserReport" ADD COLUMN     "state" "UserReportState" NOT NULL DEFAULT 'AWAITING_REVIEW';
