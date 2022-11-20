-- CreateTable
CREATE TABLE "GameDatastore" (
    "id" TEXT NOT NULL,
    "gameId" INTEGER NOT NULL,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameDatastore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameDatastoreKeyValuePair" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "gameDatastoreId" TEXT NOT NULL,

    CONSTRAINT "GameDatastoreKeyValuePair_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GameDatastore" ADD CONSTRAINT "GameDatastore_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameDatastoreKeyValuePair" ADD CONSTRAINT "GameDatastoreKeyValuePair_gameDatastoreId_fkey" FOREIGN KEY ("gameDatastoreId") REFERENCES "GameDatastore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
