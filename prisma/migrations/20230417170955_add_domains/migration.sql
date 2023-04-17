-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('UNVERIFIED', 'VERIFIED', 'GENERATING_CERTIFICATE', 'COMPLETE');

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "domain" TEXT NOT NULL,
    "status" "DomainStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "txtRecord" TEXT NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
