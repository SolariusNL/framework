-- CreateEnum
CREATE TYPE "NucleusStdoutType" AS ENUM ('GENERIC', 'ERROR', 'WARNING');

-- AlterTable
ALTER TABLE "NucleusStdout" ADD COLUMN     "type" "NucleusStdoutType" NOT NULL DEFAULT 'GENERIC';
