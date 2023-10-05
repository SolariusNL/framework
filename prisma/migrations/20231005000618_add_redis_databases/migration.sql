-- CreateEnum
CREATE TYPE "RedisDatabaseType" AS ENUM ('REGIONAL', 'GLOBAL');

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "funds" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "RedisDatabase" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "type" "RedisDatabaseType" NOT NULL,
    "region" TEXT NOT NULL,
    "multiZoneReplication" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "RedisDatabase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RedisDatabase" ADD CONSTRAINT "RedisDatabase_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
