-- CreateEnum
CREATE TYPE "GamePlatform" AS ENUM ('PC', 'MOBILE', 'VR');

-- CreateEnum
CREATE TYPE "ContentWarning" AS ENUM ('VIOLENCE', 'SEXUAL_CONTENT', 'STRONG_LANGUAGE', 'DRUG_ABUSE', 'ALCOHOL_ABUSE', 'SELF_HARM', 'SUICIDAL_CONTENT', 'NUDITY', 'DISCRIMINATION', 'GRAPHIC_IMAGES', 'SENSITIVE_TOPIC', 'DEATH', 'ABUSE', 'MENTAL_HEALTH', 'MEDICAL_PROCEDURES', 'FLASHING_LIGHTS');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "attemptLiveUpdates" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "chatFilterEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "contentWarnings" "ContentWarning"[],
ADD COLUMN     "enforceLatestVersion" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "feedbackEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "hasParentalControls" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requiredAccountAge" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "restartOnUpdate" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "soyoruEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "supportedPlatforms" "GamePlatform"[] DEFAULT ARRAY['PC', 'MOBILE', 'VR']::"GamePlatform"[],
ADD COLUMN     "voiceEnabled" BOOLEAN NOT NULL DEFAULT true;
