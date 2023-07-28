-- CreateEnum
CREATE TYPE "AppConfigUnionType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'ARRAY', 'OBJECT');

-- CreateTable
CREATE TABLE "AppConfig" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "key" TEXT NOT NULL,
    "type" "AppConfigUnionType" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);
