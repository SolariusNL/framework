-- CreateTable
CREATE TABLE "_oauth2Clients" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_oauth2Clients_AB_unique" ON "_oauth2Clients"("A", "B");

-- CreateIndex
CREATE INDEX "_oauth2Clients_B_index" ON "_oauth2Clients"("B");

-- AddForeignKey
ALTER TABLE "_oauth2Clients" ADD CONSTRAINT "_oauth2Clients_A_fkey" FOREIGN KEY ("A") REFERENCES "OAuth2Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_oauth2Clients" ADD CONSTRAINT "_oauth2Clients_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
