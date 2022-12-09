-- CreateEnum
CREATE TYPE "PrivacyPreferences" AS ENUM ('RECORD_SEARCH', 'USAGE_ANALYTICS', 'RECEIVE_NEWSLETTER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "privacyPreferences" "PrivacyPreferences"[];
