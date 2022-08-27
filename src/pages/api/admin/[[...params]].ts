import { createHandler, Get } from "@storyofams/next-api-decorators";
import { AdminAuthorized } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import { nonCurrentUserSelect } from "../../../util/prisma-types";

class AdminRouter {
  @Get("/reports")
  @AdminAuthorized()
  public async getLatestReports() {
    const latestReports = await prisma.userReport.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      where: {
        processed: false,
      },
      include: {
        user: nonCurrentUserSelect,
        author: nonCurrentUserSelect,
      },
    });

    return latestReports;
  }

  @Get("/analytics")
  @AdminAuthorized()
  public async getAnalytics() {
    const usersCreatedThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
    });

    const usersCreatedLastMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 60)),
          lte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
    });

    return {
      user: {
        userDiff:
          ((usersCreatedThisMonth - usersCreatedLastMonth) /
            usersCreatedLastMonth) *
          100,
        usersLastMonth: usersCreatedLastMonth,
        usersThisMonth: usersCreatedThisMonth,
        totalUsers: await prisma.user.count(),
        bannedUsers: await prisma.user.count({ where: { banned: true } }),
      },
      games: {
        totalGames: await prisma.game.count(),
      },
    };
  }
}

export default createHandler(AdminRouter);
