-- CreateEnum
CREATE TYPE "OperatingSystem" AS ENUM ('WINDOWS', 'MAC', 'LINUX', 'ANDROID', 'IOS', 'OTHER');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "os" "OperatingSystem" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "ua" TEXT NOT NULL DEFAULT '';
