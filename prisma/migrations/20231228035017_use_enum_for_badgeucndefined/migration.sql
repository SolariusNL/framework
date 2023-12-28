/*
  Warnings:

  - The `badges` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Badge" AS ENUM ('PRE_ALPHA', 'ALPHA', 'STAFF', 'PREMIUM', 'VETERAN', 'WANDERER', 'SCRIPTER', 'MAESTRO');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "badges",
ADD COLUMN     "badges" "Badge"[] DEFAULT ARRAY['ALPHA']::"Badge"[];
