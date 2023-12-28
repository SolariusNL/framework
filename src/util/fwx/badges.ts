import { Badge } from "@prisma/client";
import prisma from "../prisma";
import { NonUser } from "../prisma-types";

export const Badges = {
  grant: async (badge: Badge, user: NonUser | number) => {
    const userId = typeof user === "number" ? user : user.id;
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
  },
  revoke: async (badge: Badge, user: NonUser | number) => {
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
      .then((u) => u!.badges);

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
  },
};
