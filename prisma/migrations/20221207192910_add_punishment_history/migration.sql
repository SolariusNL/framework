-- CreateEnum
CREATE TYPE "PunishmentType" AS ENUM ('BAN', 'WARNING');

-- CreateTable
CREATE TABLE "PunishmentLog" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "punishedById" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "PunishmentType" NOT NULL,

    CONSTRAINT "PunishmentLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PunishmentLog" ADD CONSTRAINT "PunishmentLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PunishmentLog" ADD CONSTRAINT "PunishmentLog_punishedById_fkey" FOREIGN KEY ("punishedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
