-- CreateEnum
CREATE TYPE "GameGenre" AS ENUM ('ACTION', 'ADVENTURE', 'RPG', 'STRATEGY', 'SIMULATION', 'SPORTS', 'PUZZLE', 'RACING', 'ROLE_PLAYING', 'HORROR', 'FANTASY', 'MMO', 'SHOOTER', 'OTHER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUri" TEXT NOT NULL DEFAULT 'https://avatars.dicebear.com/api/identicon/framework.svg';

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "genre" "GameGenre" NOT NULL,
    "description" TEXT NOT NULL,
    "maxPlayersPerSession" INTEGER NOT NULL DEFAULT 15,
    "connectDataId" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "iconUri" TEXT NOT NULL,
    "gallery" TEXT[],

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectData" (
    "id" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "ip" TEXT NOT NULL,
    "port" INTEGER NOT NULL,

    CONSTRAINT "ConnectData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Update" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "tag" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Update_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConnectData_gameId_key" ON "ConnectData"("gameId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectData" ADD CONSTRAINT "ConnectData_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Update" ADD CONSTRAINT "Update_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
