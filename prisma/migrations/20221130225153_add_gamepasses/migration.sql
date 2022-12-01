-- CreateTable
CREATE TABLE "Gamepass" (
    "id" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gamepass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_userGamepasses" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_userGamepasses_AB_unique" ON "_userGamepasses"("A", "B");

-- CreateIndex
CREATE INDEX "_userGamepasses_B_index" ON "_userGamepasses"("B");

-- AddForeignKey
ALTER TABLE "Gamepass" ADD CONSTRAINT "Gamepass_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userGamepasses" ADD CONSTRAINT "_userGamepasses_A_fkey" FOREIGN KEY ("A") REFERENCES "Gamepass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userGamepasses" ADD CONSTRAINT "_userGamepasses_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
