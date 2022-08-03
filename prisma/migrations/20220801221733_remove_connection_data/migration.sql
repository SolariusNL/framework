/*
  Warnings:

  - You are about to drop the column `connectDataId` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the `ConnectData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ConnectData" DROP CONSTRAINT "ConnectData_gameId_fkey";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "connectDataId";

-- DropTable
DROP TABLE "ConnectData";
