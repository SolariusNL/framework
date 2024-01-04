-- CreateTable
CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER NOT NULL,
    "contentMd" TEXT NOT NULL,
    "attachments" TEXT[],

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_socialPostHearts" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_socialPostShares" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_socialPostReplies" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_socialPostHearts_AB_unique" ON "_socialPostHearts"("A", "B");

-- CreateIndex
CREATE INDEX "_socialPostHearts_B_index" ON "_socialPostHearts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_socialPostShares_AB_unique" ON "_socialPostShares"("A", "B");

-- CreateIndex
CREATE INDEX "_socialPostShares_B_index" ON "_socialPostShares"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_socialPostReplies_AB_unique" ON "_socialPostReplies"("A", "B");

-- CreateIndex
CREATE INDEX "_socialPostReplies_B_index" ON "_socialPostReplies"("B");

-- AddForeignKey
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_socialPostHearts" ADD CONSTRAINT "_socialPostHearts_A_fkey" FOREIGN KEY ("A") REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_socialPostHearts" ADD CONSTRAINT "_socialPostHearts_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_socialPostShares" ADD CONSTRAINT "_socialPostShares_A_fkey" FOREIGN KEY ("A") REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_socialPostShares" ADD CONSTRAINT "_socialPostShares_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_socialPostReplies" ADD CONSTRAINT "_socialPostReplies_A_fkey" FOREIGN KEY ("A") REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_socialPostReplies" ADD CONSTRAINT "_socialPostReplies_B_fkey" FOREIGN KEY ("B") REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
