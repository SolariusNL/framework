-- CreateEnum
CREATE TYPE "UserSignalType" AS ENUM ('CLEAR_LOCALSTORAGE', 'MODAL_ALERT');

-- CreateTable
CREATE TABLE "UserSignal" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "UserSignalType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSignalDataRow" (
    "id" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "UserSignalDataRow_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserSignal" ADD CONSTRAINT "UserSignal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSignalDataRow" ADD CONSTRAINT "UserSignalDataRow_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "UserSignal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
