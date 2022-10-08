-- CreateEnum
CREATE TYPE "RatingType" AS ENUM ('EC', 'E', 'E10', 'T', 'M', 'AO', 'RP');

-- CreateEnum
CREATE TYPE "RatingCategoryScore" AS ENUM ('PASSING', 'FAILING');

-- CreateEnum
CREATE TYPE "RatingCategory" AS ENUM ('SOCIAL', 'DRUGS', 'NUDITY');

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "type" "RatingType" NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatingScore" (
    "id" TEXT NOT NULL,
    "ratingId" TEXT NOT NULL,
    "category" "RatingCategory" NOT NULL,
    "score" "RatingCategoryScore" NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "RatingScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rating_gameId_key" ON "Rating"("gameId");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatingScore" ADD CONSTRAINT "RatingScore_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "Rating"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
