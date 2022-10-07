-- AlterTable
ALTER TABLE "ChecklistItem" ADD COLUMN     "scheduled" TIMESTAMP(3),
ADD COLUMN     "tags" TEXT[];
