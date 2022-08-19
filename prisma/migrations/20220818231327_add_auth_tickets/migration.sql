-- CreateTable
CREATE TABLE "NucleusAuthTicket" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "ticket" TEXT NOT NULL,

    CONSTRAINT "NucleusAuthTicket_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NucleusAuthTicket" ADD CONSTRAINT "NucleusAuthTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
