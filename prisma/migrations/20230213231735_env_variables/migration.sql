-- CreateEnum
CREATE TYPE "GameEnvironment" AS ENUM ('PRODUCTION', 'DEVELOPMENT');

-- CreateTable
CREATE TABLE "GameEnvironmentVariable" (
    "id" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "environment" "GameEnvironment" NOT NULL,

    CONSTRAINT "GameEnvironmentVariable_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GameEnvironmentVariable" ADD CONSTRAINT "GameEnvironmentVariable_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
