-- CreateTable
CREATE TABLE "NewLogin" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device" "OperatingSystem" NOT NULL,
    "ip" TEXT NOT NULL,

    CONSTRAINT "NewLogin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewLogin_userId_key" ON "NewLogin"("userId");

-- AddForeignKey
ALTER TABLE "NewLogin" ADD CONSTRAINT "NewLogin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
