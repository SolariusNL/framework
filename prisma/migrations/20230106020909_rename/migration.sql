/*
  Warnings:

  - You are about to drop the `APIKey` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ApiKeyPermission" AS ENUM ('USER_PROFILE_READ', 'USER_PROFILE_WRITE', 'USER_GAMES_READ', 'USER_GAMES_WRITE', 'GATEWAY', 'USER_MEDIA_READ', 'USER_CHAT_READ', 'USER_CHAT_WRITE', 'USER_CHECKLIST_READ', 'USER_CHECKLIST_WRITE');

-- DropForeignKey
ALTER TABLE "APIKey" DROP CONSTRAINT "APIKey_userId_fkey";

-- DropTable
DROP TABLE "APIKey";

-- DropEnum
DROP TYPE "APIKeyPermission";

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "permissions" "ApiKeyPermission"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
