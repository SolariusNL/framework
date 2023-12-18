import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config({ path: "../.env" });

interface CustomNodeJsGlobal extends Global {
  prisma: PrismaClient;
}

declare const global: CustomNodeJsGlobal;
const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
