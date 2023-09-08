-- CreateEnum
CREATE TYPE "AbuseReportState" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "AbuseReportContentIdType" AS ENUM ('STRING', 'NUMBER');

-- CreateTable
CREATE TABLE "AbuseReport" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER NOT NULL,
    "state" "AbuseReportState" NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentIdType" "AbuseReportContentIdType" NOT NULL,

    CONSTRAINT "AbuseReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AbuseReport" ADD CONSTRAINT "AbuseReport_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
