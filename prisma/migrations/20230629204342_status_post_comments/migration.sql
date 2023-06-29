-- CreateTable
CREATE TABLE "StatusPostComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,

    CONSTRAINT "StatusPostComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StatusPostComment" ADD CONSTRAINT "StatusPostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "StatusPosts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusPostComment" ADD CONSTRAINT "StatusPostComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
