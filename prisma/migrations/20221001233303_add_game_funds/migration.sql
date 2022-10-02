-- CreateTable
CREATE TABLE "GameFund" (
    "id" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "current" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastDonation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameFund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_donatedFunds" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_donatedFunds_AB_unique" ON "_donatedFunds"("A", "B");

-- CreateIndex
CREATE INDEX "_donatedFunds_B_index" ON "_donatedFunds"("B");

-- AddForeignKey
ALTER TABLE "GameFund" ADD CONSTRAINT "GameFund_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_donatedFunds" ADD CONSTRAINT "_donatedFunds_A_fkey" FOREIGN KEY ("A") REFERENCES "GameFund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_donatedFunds" ADD CONSTRAINT "_donatedFunds_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
