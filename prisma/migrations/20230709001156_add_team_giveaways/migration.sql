-- CreateTable
CREATE TABLE "TeamGiveaway" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "tickets" INTEGER NOT NULL,

    CONSTRAINT "TeamGiveaway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_teamGiveawayParticipants" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_teamGiveawayParticipants_AB_unique" ON "_teamGiveawayParticipants"("A", "B");

-- CreateIndex
CREATE INDEX "_teamGiveawayParticipants_B_index" ON "_teamGiveawayParticipants"("B");

-- AddForeignKey
ALTER TABLE "TeamGiveaway" ADD CONSTRAINT "TeamGiveaway_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_teamGiveawayParticipants" ADD CONSTRAINT "_teamGiveawayParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "TeamGiveaway"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_teamGiveawayParticipants" ADD CONSTRAINT "_teamGiveawayParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
