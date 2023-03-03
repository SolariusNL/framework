-- CreateTable
CREATE TABLE "NucleusStdout" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "line" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,

    CONSTRAINT "NucleusStdout_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NucleusStdout" ADD CONSTRAINT "NucleusStdout_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "Connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
