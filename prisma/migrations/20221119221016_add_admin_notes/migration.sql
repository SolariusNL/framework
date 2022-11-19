-- CreateTable
CREATE TABLE "UserAdminNotes" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,

    CONSTRAINT "UserAdminNotes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserAdminNotes" ADD CONSTRAINT "UserAdminNotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAdminNotes" ADD CONSTRAINT "UserAdminNotes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
