/*
  Warnings:

  - You are about to drop the `OAuth2Access` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OAuth2Client` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_oauth2Clients` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OAuth2Access" DROP CONSTRAINT "OAuth2Access_clientId_fkey";

-- DropForeignKey
ALTER TABLE "OAuth2Access" DROP CONSTRAINT "OAuth2Access_userId_fkey";

-- DropForeignKey
ALTER TABLE "_oauth2Clients" DROP CONSTRAINT "_oauth2Clients_A_fkey";

-- DropForeignKey
ALTER TABLE "_oauth2Clients" DROP CONSTRAINT "_oauth2Clients_B_fkey";

-- DropTable
DROP TABLE "OAuth2Access";

-- DropTable
DROP TABLE "OAuth2Client";

-- DropTable
DROP TABLE "_oauth2Clients";
