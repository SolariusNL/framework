-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailRequiredLogin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "EmailLoginRequest" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLoginRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmailLoginRequest" ADD CONSTRAINT "EmailLoginRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
