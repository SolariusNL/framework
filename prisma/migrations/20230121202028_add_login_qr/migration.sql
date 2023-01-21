-- CreateTable
CREATE TABLE "LoginQR" (
    "id" TEXT NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" INTEGER NOT NULL,

    CONSTRAINT "LoginQR_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LoginQR_userId_key" ON "LoginQR"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LoginQR_code_key" ON "LoginQR"("code");

-- AddForeignKey
ALTER TABLE "LoginQR" ADD CONSTRAINT "LoginQR_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
