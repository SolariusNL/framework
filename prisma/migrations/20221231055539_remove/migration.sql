/*
  Warnings:

  - You are about to drop the `ChatConversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_chatConversations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "_chatConversations" DROP CONSTRAINT "_chatConversations_A_fkey";

-- DropForeignKey
ALTER TABLE "_chatConversations" DROP CONSTRAINT "_chatConversations_B_fkey";

-- DropTable
DROP TABLE "ChatConversation";

-- DropTable
DROP TABLE "ChatMessage";

-- DropTable
DROP TABLE "_chatConversations";
