-- AlterTable
ALTER TABLE "GameFund" ADD COLUMN     "description" TEXT NOT NULL DEFAULT 'This was created before the release of Funds 2, so no description was provided.',
ADD COLUMN     "descriptionMd" TEXT NOT NULL DEFAULT '';
