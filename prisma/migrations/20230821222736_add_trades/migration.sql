-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initiatorId" INTEGER NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "initiatorAccepted" BOOLEAN NOT NULL DEFAULT false,
    "recipientAccepted" BOOLEAN NOT NULL DEFAULT false,
    "cancelled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_tradeInitiatorItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_tradeRecipientItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_tradeInitiatorItems_AB_unique" ON "_tradeInitiatorItems"("A", "B");

-- CreateIndex
CREATE INDEX "_tradeInitiatorItems_B_index" ON "_tradeInitiatorItems"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_tradeRecipientItems_AB_unique" ON "_tradeRecipientItems"("A", "B");

-- CreateIndex
CREATE INDEX "_tradeRecipientItems_B_index" ON "_tradeRecipientItems"("B");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_tradeInitiatorItems" ADD CONSTRAINT "_tradeInitiatorItems_A_fkey" FOREIGN KEY ("A") REFERENCES "LimitedInventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_tradeInitiatorItems" ADD CONSTRAINT "_tradeInitiatorItems_B_fkey" FOREIGN KEY ("B") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_tradeRecipientItems" ADD CONSTRAINT "_tradeRecipientItems_A_fkey" FOREIGN KEY ("A") REFERENCES "LimitedInventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_tradeRecipientItems" ADD CONSTRAINT "_tradeRecipientItems_B_fkey" FOREIGN KEY ("B") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
