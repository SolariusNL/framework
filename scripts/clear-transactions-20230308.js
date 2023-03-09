const { PrismaClient } = require("@prisma/client");

async function exec() {
  const prisma = new PrismaClient();
  await prisma.transaction.deleteMany();
}

exec();
