-- CreateTable
CREATE TABLE "StatusPosts" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,

    CONSTRAINT "StatusPosts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StatusPosts" ADD CONSTRAINT "StatusPosts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
