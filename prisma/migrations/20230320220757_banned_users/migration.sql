-- CreateTable
CREATE TABLE "_teamBans" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_teamBans_AB_unique" ON "_teamBans"("A", "B");

-- CreateIndex
CREATE INDEX "_teamBans_B_index" ON "_teamBans"("B");

-- AddForeignKey
ALTER TABLE "_teamBans" ADD CONSTRAINT "_teamBans_A_fkey" FOREIGN KEY ("A") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_teamBans" ADD CONSTRAINT "_teamBans_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
