-- CreateEnum
CREATE TYPE "Grant" AS ENUM ('USER_READ');

-- CreateTable
CREATE TABLE "OAuth2Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "redirectUri" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grants" "Grant"[],

    CONSTRAINT "OAuth2Client_pkey" PRIMARY KEY ("id")
);
