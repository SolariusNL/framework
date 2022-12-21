-- CreateTable
CREATE TABLE "_adminArticlesViewed" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_adminArticlesViewed_AB_unique" ON "_adminArticlesViewed"("A", "B");

-- CreateIndex
CREATE INDEX "_adminArticlesViewed_B_index" ON "_adminArticlesViewed"("B");

-- AddForeignKey
ALTER TABLE "_adminArticlesViewed" ADD CONSTRAINT "_adminArticlesViewed_A_fkey" FOREIGN KEY ("A") REFERENCES "AdminArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_adminArticlesViewed" ADD CONSTRAINT "_adminArticlesViewed_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
