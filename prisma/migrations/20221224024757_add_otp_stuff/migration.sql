-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otpAscii" TEXT,
ADD COLUMN     "otpAuthUrl" TEXT,
ADD COLUMN     "otpBase32" TEXT,
ADD COLUMN     "otpEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otpHex" TEXT,
ADD COLUMN     "otpVerified" BOOLEAN NOT NULL DEFAULT false;
