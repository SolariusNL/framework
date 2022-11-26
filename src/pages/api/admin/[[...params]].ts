import { NotificationType } from "@prisma/client";
import {
  Body,
  createHandler,
  Get,
  Param,
  Post,
  Query,
} from "@storyofams/next-api-decorators";
import { readFile } from "fs/promises";
import { Account, AdminAuthorized } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";
import { nonCurrentUserSelect, userSelect } from "../../../util/prisma-types";
import { RateLimitMiddleware } from "../../../util/rateLimit";

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

    await prisma.invite.createMany({
      data: keys.map((key) => ({
        code: key,
      })),
    });

    return keys;
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

  @Get("/users/:page")
  @AdminAuthorized()
  public async getUsers(@Param("page") page: number) {
    const users = await prisma.user.findMany({
      select: {
        ...userSelect,
        sessions: true,
        discordAccount: true,
        notifications: true,
        notes: {
          include: {
            author: nonCurrentUserSelect,
            user: nonCurrentUserSelect,
          },
        },
      },
      take: 8,
      skip: Number(page) * 8,
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  }

  @Get("/userpages")
  @AdminAuthorized()
  public async getUserPages() {
    const users = await prisma.user.count();

    return Math.ceil(users / 8);
  }

  @Post("/service/discord/connect/new")
  @AdminAuthorized()
  public async connectDiscord(
    @Body()
    body: {
      imageUrl: string;
      username: string;
      discriminator: string;
      id: string;
    }
  ) {
    const code = Array.from({ length: 3 })
      .map(() =>
        Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")
      )
      .join("-");

    await prisma.discordConnectCode.create({
      data: {
        code,
        imageUrl: String(body.imageUrl),
        username: String(body.username),
        discriminator: String(body.discriminator),
        discordId: String(body.id),
      },
    });

    return {
      code,
    };
  }

  @Get("/bannedips")
  @AdminAuthorized()
  public async getBannedIps() {
    const ips = await prisma.bannedIP.findMany();
    return ips;
  }

  @Post("/bannedips/new/:ip")
  @AdminAuthorized()
  public async createBannedIp(
    @Param("ip") ip: string,
    @Query("reason") reason: string
  ) {
    if (!ip.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
      return {
        success: false,
        error: "Invalid IP",
      };
    }

    const created = await prisma.bannedIP.create({
      data: {
        ip,
        reason,
      },
    });

    return created;
  }

  @Post("/bannedips/delete/:id")
  @AdminAuthorized()
  public async deleteBannedIp(@Param("id") id: string) {
    const ip = await prisma.bannedIP.findFirst({
      where: {
        id: String(id),
      },
    });

    if (!ip) {
      return {
        success: false,
        error: "IP not found",
      };
    }

    await prisma.bannedIP.delete({
      where: {
        id: String(id),
      },
    });

    return {
      success: true,
    };
  }

  @Post("/notifications/send/:to")
  @AdminAuthorized()
  public async sendNotification(
    @Param("to") to: string | number,
    @Body() body: { title: string; message: string }
  ) {
    if (to === "all") {
      const users = await prisma.user.findMany({
        select: {
          id: true,
        },
      });

      await prisma.notification.createMany({
        data: users.map((user) => ({
          userId: Number(user.id),
          title: body.title,
          message: body.message,
          type: NotificationType.INFO,
        })),
      });
    } else {
      const user = await prisma.user.findFirst({
        where: {
          id: Number(to),
        },
      });

      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      await prisma.notification.create({
        data: {
          user: {
            connect: {
              id: Number(to),
            },
          },
          title: body.title,
          message: body.message,
          type: NotificationType.INFO,
        },
      });
    }

    return {
      success: true,
    };
  }

  @Get("/users/discord/:discordid")
  @AdminAuthorized()
  public async getUserByDiscordId(@Param("discordid") discordId: string) {
    const user = await prisma.user.findFirst({
      where: {
        discordAccount: {
          discordId: String(discordId),
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      user,
    };
  }

  @Post("/users/:uid/punish/:category")
  @AdminAuthorized()
  @RateLimitMiddleware(15)()
  public async punishUser(
    @Param("uid") uid: string,
    @Param("category") category: "ban" | "warning",
    @Body() body: { reason: string }
  ) {
    if (body.reason.length < 3 || body.reason.length > 1024) {
      return {
        success: false,
        error: "Reason must be between 3 and 1024 characters",
      };
    }

    if (category !== "ban" && category !== "warning") {
      return {
        success: false,
        error: "Invalid category",
      };
    }

    const user = await prisma.user.findFirst({
      where: {
        id: Number(uid),
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    if (category === "ban") {
      await prisma.user.update({
        where: {
          id: Number(uid),
        },
        data: {
          banned: true,
          banReason: body.reason,
        },
      });
    } else {
      await prisma.user.update({
        where: {
          id: Number(uid),
        },
        data: {
          warningViewed: false,
          warning: body.reason,
        },
      });
    }

    return {
      success: true,
    };
  }

  @Post("/users/:uid/note/new")
  @AdminAuthorized()
  @RateLimitMiddleware(15)()
  public async addNoteToUser(
    @Param("uid") uid: string,
    @Body() body: { note: string },
    @Account() account: User
  ) {
    if (body.note.length < 3 || body.note.length > 1024) {
      return {
        success: false,
        error: "Note must be between 3 and 1024 characters",
      };
    }

    const user = await prisma.user.findFirst({
      where: {
        id: Number(uid),
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const note = await prisma.userAdminNotes.create({
      data: {
        content: String(body.note),
        author: {
          connect: {
            id: Number(account.id),
          },
        },
        user: {
          connect: {
            id: Number(uid),
          },
        },
        createdAt: new Date(),
      },
      select: {
        author: nonCurrentUserSelect,
        user: nonCurrentUserSelect,
        content: true,
        createdAt: true,
        id: true,
      },
    });

    return {
      success: true,
      note: note,
    };
  }
}

export default createHandler(AdminRouter);
