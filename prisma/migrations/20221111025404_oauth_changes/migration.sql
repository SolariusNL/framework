/*
  Warnings:

  - You are about to drop the `AuthorizationCode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AuthorizationCode" DROP CONSTRAINT "AuthorizationCode_clientId_fkey";

-- DropForeignKey
ALTER TABLE "AuthorizationCode" DROP CONSTRAINT "AuthorizationCode_userId_fkey";

-- DropTable
DROP TABLE "AuthorizationCode";

-- CreateTable
CREATE TABLE "OAuth2Access" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OAuth2Access_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OAuth2Access" ADD CONSTRAINT "OAuth2Access_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "OAuth2Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OAuth2Access" ADD CONSTRAINT "OAuth2Access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
