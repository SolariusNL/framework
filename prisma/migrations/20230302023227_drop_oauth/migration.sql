/*
  Warnings:

  - You are about to drop the column `oauth` on the `Session` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "oauth",
ADD COLUMN     "oauthId" TEXT;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_oauthId_fkey" FOREIGN KEY ("oauthId") REFERENCES "OAuthApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
