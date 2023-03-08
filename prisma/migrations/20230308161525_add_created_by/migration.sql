-- AlterTable
ALTER TABLE "GiftCode" ADD COLUMN     "createdById" INTEGER;

-- AddForeignKey
ALTER TABLE "GiftCode" ADD CONSTRAINT "GiftCode_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
