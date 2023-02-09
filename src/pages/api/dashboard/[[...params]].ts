import { PrivacyPreferences } from "@prisma/client";
import { createHandler, Get } from "@storyofams/next-api-decorators";
import Authorized, { Account } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";

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
      take: 6,
      orderBy: {
        id: "desc",
      },
      where: {
        private: false,
      },
      select: {
        id: true,
        name: true,
        author: {
          select: {
            id: true,
            username: true,
            avatarUri: true,
          },
        },
        genre: true,
        description: true,
        _count: {
          select: {
            likedBy: true,
            dislikedBy: true,
          },
        },
      },
    });

    return games;
  }
}

export default createHandler(DashboardRouter);
