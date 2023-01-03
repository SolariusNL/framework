-- DropForeignKey
ALTER TABLE "EmployeeProject" DROP CONSTRAINT "EmployeeProject_employeeId_fkey";

-- CreateTable
CREATE TABLE "_employeeProjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_employeeProjects_AB_unique" ON "_employeeProjects"("A", "B");

-- CreateIndex
CREATE INDEX "_employeeProjects_B_index" ON "_employeeProjects"("B");

-- AddForeignKey
ALTER TABLE "_employeeProjects" ADD CONSTRAINT "_employeeProjects_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_employeeProjects" ADD CONSTRAINT "_employeeProjects_B_fkey" FOREIGN KEY ("B") REFERENCES "EmployeeProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
