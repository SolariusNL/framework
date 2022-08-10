-- CreateTable
CREATE TABLE "NucleusKey" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,

    CONSTRAINT "NucleusKey_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NucleusKey" ADD CONSTRAINT "NucleusKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
