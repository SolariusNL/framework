import Authorized, { Account } from "@/util/api/authorized";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import { gameSelect } from "@/util/prisma-types";
import { PrivacyPreferences } from "@prisma/client";
import { createHandler, Get } from "@solariusnl/next-api-decorators";

class DashboardRouter {
  @Get("/friends")
  @Authorized()
  public async getFriends(@Account() user: User) {
    const friends = await prisma.user.findMany({
      where: {
        followers: {
          some: {
            id: user.id,
          },
        },
        following: {
          some: {
            id: user.id,
          },
        },
      },
      select: {
        id: true,
        avatarUri: true,
        username: true,
        alias: true,
        bio: true,
        lastSeen: true,
        verified: true,
        _count: {
          select: {
            stories: true,
          },
        },
      },
    });

    const recommendedFriends = await prisma.user.findMany({
      where: {
        followers: {
          some: {
            followers: {
              some: {
                id: user.id,
              },
            },
          },
        },
        following: {
          some: {
            following: {
              some: {
                id: user.id,
              },
            },
          },
        },
        id: {
          not: user.id,
        },
        NOT: {
          followers: {
            some: {
              id: user.id,
            },
          },
          following: {
            some: {
              id: user.id,
            },
          },
        },
        privacyPreferences: {
          has: PrivacyPreferences.USER_DISCOVERY,
        },
      },
      select: {
        id: true,
        avatarUri: true,
        username: true,
        alias: true,
        bio: true,
        lastSeen: true,
        following: {
          where: {
            id: user.id,
          },
          select: {
            id: true,
          },
        },
      },
      take: 4,
    });

    return {
      allFriends: friends,
      recommendedFriends,
    };
  }

  @Get("/recommended/games")
  @Authorized()
  public async getRecommendedGames(@Account() user: User) {
    const games = await prisma.game.findMany({
      take: 8,
      orderBy: {
        id: "desc",
      },
      where: {
        private: false,
      },
      select: gameSelect,
    });

    return games;
  }
}

export default createHandler(DashboardRouter);
