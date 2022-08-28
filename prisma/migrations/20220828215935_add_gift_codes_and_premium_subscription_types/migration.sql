-- CreateEnum
CREATE TYPE "PremiumSubscriptionType" AS ENUM ('PREMIUM_ONE_MONTH', 'PREMIUM_SIX_MONTHS', 'PREMIUM_ONE_YEAR');

-- CreateEnum
CREATE TYPE "GiftCodeGrant" AS ENUM ('PREMIUM_ONE_MONTH', 'PREMIUM_SIX_MONTHS', 'PREMIUM_ONE_YEAR', 'THOUSAND_TICKETS', 'TWOTHOUSAND_TICKETS', 'FIVETHOUSAND_TICKETS', 'SIXTEENTHOUSAND_TICKETS');

-- CreateTable
CREATE TABLE "GiftCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "grant" "GiftCodeGrant" NOT NULL DEFAULT 'PREMIUM_ONE_MONTH',
    "redeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemedAt" TIMESTAMP(3) NOT NULL,
    "redeemedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PremiumSubscription" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "PremiumSubscriptionType" NOT NULL DEFAULT 'PREMIUM_ONE_MONTH',

    CONSTRAINT "PremiumSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PremiumSubscription_userId_key" ON "PremiumSubscription"("userId");

-- AddForeignKey
ALTER TABLE "GiftCode" ADD CONSTRAINT "GiftCode_redeemedById_fkey" FOREIGN KEY ("redeemedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PremiumSubscription" ADD CONSTRAINT "PremiumSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
