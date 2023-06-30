-- CreateEnum
CREATE TYPE "NotificationActionVariant" AS ENUM ('PRIMARY', 'SECONDARY');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "seen" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "NotificationAction" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "variant" "NotificationActionVariant" NOT NULL DEFAULT 'PRIMARY',

    CONSTRAINT "NotificationAction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NotificationAction" ADD CONSTRAINT "NotificationAction_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
