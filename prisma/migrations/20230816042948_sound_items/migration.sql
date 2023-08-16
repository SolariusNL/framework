-- CreateTable
CREATE TABLE "_userSounds" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_userSounds_AB_unique" ON "_userSounds"("A", "B");

-- CreateIndex
CREATE INDEX "_userSounds_B_index" ON "_userSounds"("B");

-- AddForeignKey
ALTER TABLE "_userSounds" ADD CONSTRAINT "_userSounds_A_fkey" FOREIGN KEY ("A") REFERENCES "Inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userSounds" ADD CONSTRAINT "_userSounds_B_fkey" FOREIGN KEY ("B") REFERENCES "Sound"("id") ON DELETE CASCADE ON UPDATE CASCADE;
