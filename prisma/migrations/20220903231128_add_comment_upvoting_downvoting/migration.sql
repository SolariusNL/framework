-- CreateTable
CREATE TABLE "_upvotedComments" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_downvotedComments" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_upvotedComments_AB_unique" ON "_upvotedComments"("A", "B");

-- CreateIndex
CREATE INDEX "_upvotedComments_B_index" ON "_upvotedComments"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_downvotedComments_AB_unique" ON "_downvotedComments"("A", "B");

-- CreateIndex
CREATE INDEX "_downvotedComments_B_index" ON "_downvotedComments"("B");

-- AddForeignKey
ALTER TABLE "_upvotedComments" ADD CONSTRAINT "_upvotedComments_A_fkey" FOREIGN KEY ("A") REFERENCES "GameComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_upvotedComments" ADD CONSTRAINT "_upvotedComments_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_downvotedComments" ADD CONSTRAINT "_downvotedComments_A_fkey" FOREIGN KEY ("A") REFERENCES "GameComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_downvotedComments" ADD CONSTRAINT "_downvotedComments_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
