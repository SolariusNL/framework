/*
  Warnings:

  - A unique constraint covering the columns `[serial]` on the table `LimitedCatalogItemResell` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "LimitedCatalogItemResell" ADD COLUMN     "serial" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LimitedCatalogItemResell_serial_key" ON "LimitedCatalogItemResell"("serial");
