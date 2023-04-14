-- CreateTable
CREATE TABLE "AutomodTrigger" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,

    CONSTRAINT "AutomodTrigger_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AutomodTrigger" ADD CONSTRAINT "AutomodTrigger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
