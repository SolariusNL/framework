-- CreateTable
CREATE TABLE "EmailReceipt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "template" TEXT NOT NULL,

    CONSTRAINT "EmailReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailReceiptProperties" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,

    CONSTRAINT "EmailReceiptProperties_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmailReceiptProperties" ADD CONSTRAINT "EmailReceiptProperties_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "EmailReceipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
