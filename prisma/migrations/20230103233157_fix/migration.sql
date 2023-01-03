/*
  Warnings:

  - You are about to drop the `EmployeeProject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_employeeProjects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_employeeProjects" DROP CONSTRAINT "_employeeProjects_A_fkey";

-- DropForeignKey
ALTER TABLE "_employeeProjects" DROP CONSTRAINT "_employeeProjects_B_fkey";

-- DropTable
DROP TABLE "EmployeeProject";

-- DropTable
DROP TABLE "_employeeProjects";
