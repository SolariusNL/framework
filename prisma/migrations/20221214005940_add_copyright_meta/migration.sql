-- CreateTable
CREATE TABLE "GameCopyrightMetadata" (
    "id" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameCopyrightMetadata_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GameCopyrightMetadata" ADD CONSTRAINT "GameCopyrightMetadata_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
