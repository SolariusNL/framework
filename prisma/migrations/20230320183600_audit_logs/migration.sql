-- CreateEnum
CREATE TYPE "TeamAuditLogType" AS ENUM ('UPDATE_TEAM_DETAILS', 'UPDAT_PRIVACY_STATUS', 'UPDATE_INVITED_USERS', 'UPDATE_SHOUT');

-- CreateTable
CREATE TABLE "TeamAuditLogKeyValuePair" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,

    CONSTRAINT "TeamAuditLogKeyValuePair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamAuditLog" (
    "id" TEXT NOT NULL,
    "type" "TeamAuditLogType" NOT NULL,
    "content" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "teamId" TEXT,

    CONSTRAINT "TeamAuditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TeamAuditLogKeyValuePair" ADD CONSTRAINT "TeamAuditLogKeyValuePair_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "TeamAuditLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAuditLog" ADD CONSTRAINT "TeamAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAuditLog" ADD CONSTRAINT "TeamAuditLog_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
