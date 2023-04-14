-- CreateTable
CREATE TABLE "CosmicCommand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "usage" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "connId" TEXT NOT NULL,

    CONSTRAINT "CosmicCommand_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CosmicCommand" ADD CONSTRAINT "CosmicCommand_connId_fkey" FOREIGN KEY ("connId") REFERENCES "Connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
