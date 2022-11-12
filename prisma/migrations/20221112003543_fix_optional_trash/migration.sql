-- DropForeignKey
ALTER TABLE "DiscordConnectCode" DROP CONSTRAINT "DiscordConnectCode_userId_fkey";

-- AlterTable
ALTER TABLE "DiscordConnectCode" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "DiscordConnectCode" ADD CONSTRAINT "DiscordConnectCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
