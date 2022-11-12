/*
  Warnings:

  - Added the required column `discordId` to the `DiscordConnectCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DiscordConnectCode" ADD COLUMN     "discordId" TEXT NOT NULL;
