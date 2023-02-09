-- AlterTable
ALTER TABLE "User" ALTER COLUMN "privacyPreferences" SET DEFAULT ARRAY['USER_DISCOVERY']::"PrivacyPreferences"[];
