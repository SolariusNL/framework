-- CreateTable
CREATE TABLE "PortalBoardPost" (
    "id" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" TEXT[],

    CONSTRAINT "PortalBoardPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_portalBoardPostUpvotes" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_portalBoardPostDownvotes" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_portalBoardPostUpvotes_AB_unique" ON "_portalBoardPostUpvotes"("A", "B");

-- CreateIndex
CREATE INDEX "_portalBoardPostUpvotes_B_index" ON "_portalBoardPostUpvotes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_portalBoardPostDownvotes_AB_unique" ON "_portalBoardPostDownvotes"("A", "B");

-- CreateIndex
CREATE INDEX "_portalBoardPostDownvotes_B_index" ON "_portalBoardPostDownvotes"("B");

-- AddForeignKey
ALTER TABLE "PortalBoardPost" ADD CONSTRAINT "PortalBoardPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_portalBoardPostUpvotes" ADD CONSTRAINT "_portalBoardPostUpvotes_A_fkey" FOREIGN KEY ("A") REFERENCES "PortalBoardPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_portalBoardPostUpvotes" ADD CONSTRAINT "_portalBoardPostUpvotes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_portalBoardPostDownvotes" ADD CONSTRAINT "_portalBoardPostDownvotes_A_fkey" FOREIGN KEY ("A") REFERENCES "PortalBoardPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_portalBoardPostDownvotes" ADD CONSTRAINT "_portalBoardPostDownvotes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
