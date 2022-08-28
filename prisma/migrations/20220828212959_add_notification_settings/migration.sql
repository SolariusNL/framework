-- CreateEnum
CREATE TYPE "ReceiveNotification" AS ENUM ('RECEIVED_DONATION', 'SENT_DONATION', 'LOGIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notificationPreferences" "ReceiveNotification"[];
