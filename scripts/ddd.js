const { PrismaClient } = require("@prisma/client");

async function exec() {
  const prisma = new PrismaClient();
  const allUsers = await prisma.user.findMany();

  for (const user of allUsers) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          adminPermissions: {
            push: "RUN_ACTIONS"
          }
        },
      });
  }
}

exec();
