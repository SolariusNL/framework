/*
  Warnings:

  - You are about to drop the column `data` on the `InstanceConfiguration` table. All the data in the column will be lost.
  - Added the required column `description` to the `InstanceConfiguration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `InstanceConfiguration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `InstanceConfiguration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InstanceConfiguration" DROP COLUMN "data",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL;
