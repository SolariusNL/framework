-- CreateTable
CREATE TABLE "CosmicWebhookSignature" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CosmicWebhookSignature_pkey" PRIMARY KEY ("id")
);
