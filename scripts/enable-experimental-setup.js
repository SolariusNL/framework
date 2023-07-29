const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

await prisma.appConfig.update({
  where: {
    id: "did-setup",
  },
  data: {
    value: "false",
  },
});

console.log("Experimental setup enabled.");

prism.$disconnect();
process.exit(0);
