/*
  Warnings:

  - A unique constraint covering the columns `[serial]` on the table `LimitedInventoryItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "LimitedInventoryItem" ADD COLUMN     "serial" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LimitedInventoryItem_serial_key" ON "LimitedInventoryItem"("serial");
