-- CreateTable
CREATE TABLE "Sound" (
    "id" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "audioUri" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_userStarredSounds" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_userStarredSounds_AB_unique" ON "_userStarredSounds"("A", "B");

-- CreateIndex
CREATE INDEX "_userStarredSounds_B_index" ON "_userStarredSounds"("B");

-- AddForeignKey
ALTER TABLE "Sound" ADD CONSTRAINT "Sound_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userStarredSounds" ADD CONSTRAINT "_userStarredSounds_A_fkey" FOREIGN KEY ("A") REFERENCES "Sound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userStarredSounds" ADD CONSTRAINT "_userStarredSounds_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
