const { PrismaClient } = require("@prisma/client");

async function exec() {
  const prisma = new PrismaClient();
  await prisma.user.updateMany({
    data: {
      premium: false,
    },
  });
  await prisma.premiumSubscription.deleteMany();
}

exec();
