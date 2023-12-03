-- CreateTable
CREATE TABLE "UploadedLicense" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" TEXT NOT NULL,

    CONSTRAINT "UploadedLicense_pkey" PRIMARY KEY ("id")
);
