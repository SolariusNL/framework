/*
  Warnings:

  - Changed the type of `code` on the `Referral` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Referral" DROP COLUMN "code",
ADD COLUMN     "code" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Referral_code_key" ON "Referral"("code");
