-- DropForeignKey
ALTER TABLE "GiftCode" DROP CONSTRAINT "GiftCode_redeemedById_fkey";

-- AlterTable
ALTER TABLE "GiftCode" ALTER COLUMN "redeemedById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "GiftCode" ADD CONSTRAINT "GiftCode_redeemedById_fkey" FOREIGN KEY ("redeemedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
