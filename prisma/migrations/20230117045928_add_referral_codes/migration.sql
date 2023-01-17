-- AlterTable
ALTER TABLE "User" ADD COLUMN     "usedReferralId" TEXT;

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Referral_code_key" ON "Referral"("code");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_usedReferralId_fkey" FOREIGN KEY ("usedReferralId") REFERENCES "Referral"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
