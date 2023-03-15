-- CreateEnum
CREATE TYPE "TeamIssueStatus" AS ENUM ('OPEN', 'CLOSED', 'DUPLICATE');

-- CreateEnum
CREATE TYPE "TeamIssueEnvironmentType" AS ENUM ('DESKTOP', 'MOBILE', 'CONSOLE');

-- CreateTable
CREATE TABLE "TeamIssue" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentMd" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "status" "TeamIssueStatus" NOT NULL,
    "gameId" INTEGER,
    "authorId" INTEGER NOT NULL,
    "assigneeId" INTEGER,
    "environment" "TeamIssueEnvironmentType" NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "TeamIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamIssueComment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "contentMd" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "issueId" TEXT NOT NULL,

    CONSTRAINT "TeamIssueComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TeamIssue" ADD CONSTRAINT "TeamIssue_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamIssue" ADD CONSTRAINT "TeamIssue_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamIssue" ADD CONSTRAINT "TeamIssue_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamIssue" ADD CONSTRAINT "TeamIssue_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamIssueComment" ADD CONSTRAINT "TeamIssueComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamIssueComment" ADD CONSTRAINT "TeamIssueComment_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "TeamIssue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
