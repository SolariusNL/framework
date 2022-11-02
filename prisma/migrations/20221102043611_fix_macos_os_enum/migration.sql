/*
  Warnings:

  - The values [MAC] on the enum `OperatingSystem` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OperatingSystem_new" AS ENUM ('WINDOWS', 'MACOS', 'LINUX', 'ANDROID', 'IOS', 'OTHER');
ALTER TABLE "Session" ALTER COLUMN "os" DROP DEFAULT;
ALTER TABLE "Session" ALTER COLUMN "os" TYPE "OperatingSystem_new" USING ("os"::text::"OperatingSystem_new");
ALTER TYPE "OperatingSystem" RENAME TO "OperatingSystem_old";
ALTER TYPE "OperatingSystem_new" RENAME TO "OperatingSystem";
DROP TYPE "OperatingSystem_old";
ALTER TABLE "Session" ALTER COLUMN "os" SET DEFAULT 'OTHER';
COMMIT;
