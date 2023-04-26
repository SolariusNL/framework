-- CreateEnum
CREATE TYPE "FastFlagUnionType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN');

-- CreateTable
CREATE TABLE "FastFlag" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "valueType" "FastFlagUnionType" NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "FastFlag_pkey" PRIMARY KEY ("id")
);
