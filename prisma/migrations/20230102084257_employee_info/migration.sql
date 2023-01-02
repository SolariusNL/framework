/*
  Warnings:

  - A unique constraint covering the columns `[employeeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EmployeeRole" AS ENUM ('CONTENT_MODERATOR', 'SUPPORT_AGENT', 'SOFTWARE_ENGINEER', 'INVESTOR', 'MARKETING', 'VICE_PRESIDENT', 'PRESIDENT', 'LEGAL_COUNSEL', 'SENIOR_SOFTWARE_ENGINEER', 'NETWORK_ADMINISTRATOR', 'NETWORK_ENGINEER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "employeeId" INTEGER;

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "userId" INTEGER,
    "role" "EmployeeRole" NOT NULL DEFAULT 'CONTENT_MODERATOR',
    "fullName" TEXT NOT NULL,
    "contractExpiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contactEmail" TEXT NOT NULL,
    "probationary" BOOLEAN NOT NULL DEFAULT true,
    "nextAssessmentAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeAssessment" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL,

    CONSTRAINT "EmployeeAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_role_key" ON "Employee"("role");

-- CreateIndex
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAssessment" ADD CONSTRAINT "EmployeeAssessment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
