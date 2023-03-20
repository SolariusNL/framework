-- CreateTable
CREATE TABLE "_teamStaff" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_teamStaff_AB_unique" ON "_teamStaff"("A", "B");

-- CreateIndex
CREATE INDEX "_teamStaff_B_index" ON "_teamStaff"("B");

-- AddForeignKey
ALTER TABLE "_teamStaff" ADD CONSTRAINT "_teamStaff_A_fkey" FOREIGN KEY ("A") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_teamStaff" ADD CONSTRAINT "_teamStaff_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
