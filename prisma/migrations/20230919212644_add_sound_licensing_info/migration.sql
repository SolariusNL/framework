-- AlterTable
ALTER TABLE "Sound" ADD COLUMN     "licensedToId" TEXT;

-- CreateTable
CREATE TABLE "SoundLicenseHolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SoundLicenseHolder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Sound" ADD CONSTRAINT "Sound_licensedToId_fkey" FOREIGN KEY ("licensedToId") REFERENCES "SoundLicenseHolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
