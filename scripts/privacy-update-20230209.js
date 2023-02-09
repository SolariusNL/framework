const { PrismaClient } = require("@prisma/client");

async function exec() {
  const prisma = new PrismaClient();
  const allUsers = await prisma.user.findMany();

  for (const user of allUsers) {
    const privacyPreferences = user.privacyPreferences || [];
    if (!privacyPreferences.includes("USER_DISCOVERY")) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          privacyPreferences: {
            push: "USER_DISCOVERY",
          },
        },
      });
      console.log(`Updated user ${user.id}`);
    }
  }
}

exec();
