-- CreateTable
CREATE TABLE "Avatar" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "headColor" TEXT NOT NULL DEFAULT 'rgb(244, 204, 67)',
    "leftArmColor" TEXT NOT NULL DEFAULT 'rgb(244, 204, 67)',
    "leftLegColor" TEXT NOT NULL DEFAULT 'rgb(165, 188, 80)',
    "rightArmColor" TEXT NOT NULL DEFAULT 'rgb(244, 204, 67)',
    "rightLegColor" TEXT NOT NULL DEFAULT 'rgb(165, 188, 80)',
    "torsoColor" TEXT NOT NULL DEFAULT 'rgb(23, 107, 170)',

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_userId_key" ON "Avatar"("userId");

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
