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
import { nonCurrentUserSelect, userSelect } from "../../../util/prisma-types";

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

    function createKey() {
      const key = Array.from({ length: 4 })
        .map(() =>
          Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, "0")
        )
        .join("-");

      return key;
    }

    const keys = Array.from({ length: amount }).map(() => createKey());

    const invites = await prisma.invite.createMany({
      data: keys.map((key) => ({
        code: key,
      })),
    });

    return invites;
  }

  @Post("/invites/delete/:id")
  @AdminAuthorized()
  public async deleteInvite(@Param("id") id: string) {
    const invite = await prisma.invite.findFirst({
      where: {
        id: String(id),
      },
    });

    if (!invite) {
      return {
        success: false,
        error: "Invite not found",
      };
    }

    await prisma.invite.delete({
      where: {
        id: String(id),
      },
    });

    return {
      success: true,
    };
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

  @Get("/users")
  @AdminAuthorized()
  public async getUsers() {
    const users = await prisma.user.findMany({
      select: {
        ...userSelect,
        sessions: true,
      },
      take: 100,
    });

    return users;
  }
}

export default createHandler(AdminRouter);
