/*
  Warnings:

  - The values [TRADES_AVAILABLE] on the enum `PrivacyPreferences` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Trade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_tradeInitiatorItems` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_tradeRecipientItems` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PrivacyPreferences_new" AS ENUM ('RECORD_SEARCH', 'USAGE_ANALYTICS', 'RECEIVE_NEWSLETTER', 'USER_DISCOVERY', 'CHAT_REQUESTS', 'HIDE_INVENTORY');
ALTER TABLE "User" ALTER COLUMN "privacyPreferences" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "privacyPreferences" TYPE "PrivacyPreferences_new"[] USING ("privacyPreferences"::text::"PrivacyPreferences_new"[]);
ALTER TYPE "PrivacyPreferences" RENAME TO "PrivacyPreferences_old";
ALTER TYPE "PrivacyPreferences_new" RENAME TO "PrivacyPreferences";
DROP TYPE "PrivacyPreferences_old";
ALTER TABLE "User" ALTER COLUMN "privacyPreferences" SET DEFAULT ARRAY['USER_DISCOVERY']::"PrivacyPreferences"[];
COMMIT;

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_initiatorId_fkey";

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_recipientId_fkey";

-- DropForeignKey
ALTER TABLE "_tradeInitiatorItems" DROP CONSTRAINT "_tradeInitiatorItems_A_fkey";

-- DropForeignKey
ALTER TABLE "_tradeInitiatorItems" DROP CONSTRAINT "_tradeInitiatorItems_B_fkey";

-- DropForeignKey
ALTER TABLE "_tradeRecipientItems" DROP CONSTRAINT "_tradeRecipientItems_A_fkey";

-- DropForeignKey
ALTER TABLE "_tradeRecipientItems" DROP CONSTRAINT "_tradeRecipientItems_B_fkey";

-- DropTable
DROP TABLE "Trade";

-- DropTable
DROP TABLE "_tradeInitiatorItems";

-- DropTable
DROP TABLE "_tradeRecipientItems";
