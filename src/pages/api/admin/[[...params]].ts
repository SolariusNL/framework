import {
  Body,
  createHandler,
  Get,
  Param,
  Post,
} from "@storyofams/next-api-decorators";
import { readFile } from "fs/promises";
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

  @Post("/report/:id/close")
  @AdminAuthorized()
  public async closeReport(@Param("id") id: string) {
    const report = await prisma.userReport.findFirst({
      where: {
        id: String(id),
      },
    });

    if (!report) {
      return {
        success: false,
        error: "Report not found",
      };
    }

    await prisma.userReport.update({
      where: {
        id: String(id),
      },
      data: {
        processed: true,
      },
    });

    return {
      success: true,
    };
  }

  @Post("/report/:id/punish/:type")
  @AdminAuthorized()
  public async punishReportMember(
    @Param("id") id: string,
    @Param("type") type: "author" | "reported",
    @Body() body: { description: string; category: "warning" | "ban" }
  ) {
    if (type !== "author" && type !== "reported") {
      return {
        success: false,
        error: "Invalid type",
      };
    }

    if (body.category !== "warning" && body.category !== "ban") {
      return {
        success: false,
        error: "Invalid type",
      };
    }

    if (body.description.length > 1000 || body.description.length < 10) {
      return {
        success: false,
        error: "Description must be between 10 and 1000 characters",
      };
    }

    const report = await prisma.userReport.findFirst({
      where: {
        id: String(id),
      },
      include: {
        user: true,
        author: true,
      },
    });

    if (!report) {
      return {
        success: false,
        error: "Report not found",
      };
    }

    if (report.processed) {
      return {
        success: false,
        error: "Report already processed",
      };
    }

    switch (body.category) {
      case "warning":
        await prisma.user.update({
          where: {
            id: type === "author" ? report.authorId : report.userId,
          },
          data: {
            warningViewed: false,
            warning: body.description,
          },
        });
        break;
      case "ban":
        await prisma.user.update({
          where: {
            id: type === "author" ? report.authorId : report.userId,
          },
          data: {
            banned: true,
            banReason: body.description,
          },
        });
        break;
    }

    await prisma.userReport.update({
      where: {
        id: String(id),
      },
      data: {
        processed: true,
      },
    });

    return {
      success: true,
    };
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

  @Get("/invites")
  @AdminAuthorized()
  public async getInvites() {
    const invites = await prisma.invite.findMany();
    return invites;
  }

  @Post("/invites/new/:amount")
  @AdminAuthorized()
  public async createInvite(@Param("amount") amount: number) {
    if (amount < 1 || amount > 500) {
      return {
        success: false,
        error: "Amount must be between 1 and 500",
      };
    }

    const invites = await prisma.invite.createMany({
      data: Array.from({ length: amount }, () => ({
        code: `${Math.floor(Math.random() * 10000)}-${Math.floor(
          Math.random() * 10000
        )}-${Math.floor(Math.random() * 10000)}-${Math.floor(
          Math.random() * 10000
        )}`,
      })),
    });

    return invites;
  }

  @Get("/instance")
  @AdminAuthorized()
  public async getInstance() {
    const packageFile = JSON.parse(
      await readFile(
        new URL("../../../../package.json", import.meta.url),
        "utf-8"
      )
    );

    return {
      version: packageFile.version,
    };
  }
}

export default createHandler(AdminRouter);
