const { PrismaClient, Badge, Role } = require("@prisma/client");

const prisma = new PrismaClient();
const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
const PREALPHA_END = new Date("2023-12-27T00:00:00.000Z");

const grant = async (badge, userId) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      badges: {
        push: badge,
      },
    },
  });
};
const revoke = async (badge, user) => {
  const userId = typeof user === "number" ? user : user.id;
  const badges = await prisma.user
    .findUnique({
      where: {
        id: userId,
      },
      select: {
        badges: true,
      },
    })
    .then((u) => u.badges);

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      badges: {
        set: badges.filter((b) => b !== badge),
      },
    },
  });
};

const syncBadges = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return;
  }

  if (
    new Date(user.createdAt).getTime() < Date.now() - ONE_YEAR &&
    !user.badges.includes(Badge.VETERAN)
  )
    await grant(Badge.VETERAN, user.id);
  if (
    new Date(user.createdAt).getTime() < PREALPHA_END.getTime() &&
    !user.badges.includes(Badge.PRE_ALPHA)
  )
    await grant(Badge.PRE_ALPHA, user.id);

  /**
   * @todo when we add functionality to change role, remove this
   */
  if (user.role === Role.ADMIN && !user.badges.includes(Badge.STAFF))
    await grant(Badge.STAFF, user.id);
  else if (user.badges.includes(Badge.STAFF) && user.role !== Role.ADMIN)
    await revoke(Badge.STAFF, user.id);

  if (user.tickets > 1_000_000 && !user.badges.includes(Badge.TYCOON))
    await grant(Badge.TYCOON, user.id);
  else if (user.tickets < 1_000_000 && user.badges.includes(Badge.TYCOON))
    await revoke(Badge.TYCOON, user.id);

  if (user.premium && !user.badges.includes(Badge.PREMIUM))
    await grant(Badge.PREMIUM, user.id);
  else if (!user.premium && user.badges.includes(Badge.PREMIUM))
    await revoke(Badge.PREMIUM, user.id);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      lastBadgeSync: new Date(),
    },
  });
};

async function main() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    console.log("🔃 Syncing " + user.username);
    syncBadges(user.id);
    console.log("✅ Synced " + user.username);
  }
}

main();
