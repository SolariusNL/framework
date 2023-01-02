import { EmployeeRole } from "@prisma/client";

const employeeRoleMeta = new Map<EmployeeRole, string>([
  [EmployeeRole.CONTENT_MODERATOR, "Content Moderator"],
  [EmployeeRole.EXECUTIVE_VICE_PRESIDENT, "Executive Vice President"],
  [EmployeeRole.INVESTOR, "Investor"],
  [EmployeeRole.LEGAL_COUNSEL, "Legal Counsel"],
  [EmployeeRole.MARKETING, "Marketing"],
  [EmployeeRole.NETWORK_ADMINISTRATOR, "Network Administrator"],
  [EmployeeRole.NETWORK_ENGINEER, "Network Engineer"],
  [EmployeeRole.PRESIDENT, "President"],
  [EmployeeRole.SENIOR_SOFTWARE_ENGINEER, "Senior Software Engineer"],
  [EmployeeRole.SOFTWARE_ENGINEER, "Software Engineer"],
  [EmployeeRole.SUPPORT_AGENT, "Support Agent"],
  [EmployeeRole.VICE_PRESIDENT, "Vice President"],
]);

export default employeeRoleMeta;
