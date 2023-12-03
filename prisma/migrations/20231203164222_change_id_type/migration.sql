/*
  Warnings:

  - The primary key for the `ApplicationLicenseStore` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ApplicationLicenseStore` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `storeId` on the `ApplicationLicenseStoreEntry` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ApplicationLicenseStoreEntry" DROP CONSTRAINT "ApplicationLicenseStoreEntry_storeId_fkey";

-- AlterTable
ALTER TABLE "ApplicationLicenseStore" DROP CONSTRAINT "ApplicationLicenseStore_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "ApplicationLicenseStore_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ApplicationLicenseStoreEntry" DROP COLUMN "storeId",
ADD COLUMN     "storeId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ApplicationLicenseStoreEntry" ADD CONSTRAINT "ApplicationLicenseStoreEntry_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "ApplicationLicenseStore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
