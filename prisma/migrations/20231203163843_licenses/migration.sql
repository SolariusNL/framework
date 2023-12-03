-- CreateTable
CREATE TABLE "ApplicationLicense" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" TEXT NOT NULL,

    CONSTRAINT "ApplicationLicense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationLicenseStoreEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "licenseId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "storeId" TEXT NOT NULL,

    CONSTRAINT "ApplicationLicenseStoreEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationLicenseStore" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationLicenseStore_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApplicationLicenseStoreEntry" ADD CONSTRAINT "ApplicationLicenseStoreEntry_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "ApplicationLicense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationLicenseStoreEntry" ADD CONSTRAINT "ApplicationLicenseStoreEntry_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "ApplicationLicenseStore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
