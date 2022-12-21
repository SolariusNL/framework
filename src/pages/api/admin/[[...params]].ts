import {
  AdminPermission,
  NotificationType,
  PunishmentType,
} from "@prisma/client";
import {
  Body,
  createHandler,
  Get,
  Param,
  Post,
  Query,
} from "@storyofams/next-api-decorators";
import { promises as fs } from "fs";
import { AdminAction } from "../../../util/adminAction";
import { Account, AdminAuthorized } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";
import {
  nonCurrentUserSelect,
  userSelect,
  articleSelect,
} from "../../../util/prisma-types";
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
      await fs.readFile(
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
        punishmentHistory: {
          include: {
            punishedBy: nonCurrentUserSelect,
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
    @Body() body: { reason: string },
    @Account() admin: User
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

      await prisma.adminActivityLog.create({
        data: {
          user: {
            connect: {
              id: Number(admin.id),
            },
          },
          activity: `Banned user #${user.id} for ${body.reason}`,
          importance: 5,
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

      await prisma.adminActivityLog.create({
        data: {
          user: {
            connect: {
              id: Number(admin.id),
            },
          },
          activity: `Warned user #${user.id} for ${body.reason}`,
          importance: 4,
        },
      });

      await prisma.punishmentLog.create({
        data: {
          user: {
            connect: {
              id: Number(uid),
            },
          },
          punishedBy: {
            connect: {
              id: Number(admin.id),
            },
          },
          type: category.toUpperCase() as PunishmentType,
          reason: body.reason,
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

  @Get("/activity/:page")
  @AdminAuthorized()
  public async getActivity(
    @Param("page") page: number,
    @Query("importance") importance: number
  ) {
    const activity = await prisma.adminActivityLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * 50,
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUri: true,
          },
        },
      },
      ...(importance !== undefined
        ? {
            where: {
              importance: {
                gte: Number(importance),
              },
            },
          }
        : {}),
    });

    return {
      success: true,
      activity,
    };
  }

  @Get("/activitypages")
  @AdminAuthorized()
  public async getActivityPages() {
    const count = await prisma.adminActivityLog.count();

    return {
      success: true,
      pages: Math.ceil(count / 50),
    };
  }

  @Post("/action/:uid/:action")
  @AdminAuthorized()
  @RateLimitMiddleware(15)()
  public async performAction(
    @Account() account: User,
    @Param("uid") uid: string,
    @Param("action") action: AdminAction,
    @Body() body: any
  ) {
    async function createActionLog(msg: string, importance: number) {
      await prisma.adminActivityLog.create({
        data: {
          user: {
            connect: {
              id: Number(account.id),
            },
          },
          activity: msg,
          importance,
        },
      });
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

    const actions = [
      {
        name: AdminAction.ADJUST_TICKETS,
        action: async () => {
          if (body.amount < 0) {
            return {
              success: false,
              error: "Amount must be greater than 0",
            };
          }

          await prisma.user.update({
            where: {
              id: Number(uid),
            },
            data: {
              tickets: {
                set: Number(body.amount),
              },
            },
          });

          await createActionLog(
            `Adjusted ${user.username}'s tickets to ${body.amount}`,
            3
          );
        },
      },
      {
        name: AdminAction.RESET_USERNAME,
        action: async () => {
          const username = `FrameworkUser${Math.floor(
            Math.random() * 10000
          ).toString()}`;

          await prisma.user.update({
            where: {
              id: Number(uid),
            },
            data: {
              username,
            },
          });

          await createActionLog(
            `Reset ${user.username}'s username to ${username}`,
            3
          );
        },
      },
      {
        name: AdminAction.LOGOUT_SESSIONS,
        action: async () => {
          await prisma.session.deleteMany({
            where: {
              userId: Number(uid),
            },
          });

          await createActionLog(
            `Logged out all sessions for ${user.username}`,
            2
          );
        },
      },
      {
        name: AdminAction.RESET_EMAIL,
        action: async () => {
          await prisma.user.update({
            where: {
              id: Number(uid),
            },
            data: {
              emailResetRequired: true,
            },
          });

          await createActionLog(`Reset ${user.username}'s email address`, 3);
        },
      },
      {
        name: AdminAction.RESET_PASSWORD,
        action: async () => {
          await prisma.user.update({
            where: {
              id: Number(uid),
            },
            data: {
              passwordResetRequired: true,
            },
          });

          await createActionLog(`Reset ${user.username}'s password`, 3);
        },
      },
    ];

    const foundAction = actions.find((a) => a.name === (action as AdminAction));

    if (!foundAction) {
      return {
        success: false,
        error: "Invalid action",
      };
    }

    await foundAction.action();

    return {
      success: true,
    };
  }

  @Get("/articles/get")
  @AdminAuthorized()
  public async getArticles() {
    const articles = await prisma.adminArticle.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: articleSelect,
    });

    return articles;
  }

  @Post("/articles/create")
  @AdminAuthorized()
  public async createArticle(
    @Body() body: { title: string; content: string; tags: string[] },
    @Account() account: User
  ) {
    if (!account.adminPermissions.includes(AdminPermission.WRITE_ARTICLE)) {
      return {
        success: false,
        error: "You do not have permission to do this",
      };
    }

    const article = await prisma.adminArticle.create({
      data: {
        title: body.title,
        content: body.content,
        createdAt: new Date(),
        author: {
          connect: {
            id: Number(account.id),
          },
        },
        tags: {
          set: body.tags,
        },
      },
      select: articleSelect,
    });

    return article;
  }

  @Get("/articles/tags")
  @AdminAuthorized()
  public async getTags() {
    const tags = await prisma.adminArticle.findMany({
      select: {
        tags: true,
      },
    });

    return tags.flatMap((t) => t.tags);
  }

  @Post("/articles/update/:id")
  @AdminAuthorized()
  public async updateArticle(
    @Param("id") id: string,
    @Body() body: { title: string; content: string; tags: string[] },
    @Account() account: User
  ) {
    if (!account.adminPermissions.includes(AdminPermission.WRITE_ARTICLE)) {
      return {
        success: false,
        error: "You do not have permission to do this",
      };
    }

    const article = await prisma.adminArticle.update({
      where: {
        id: String(id),
      },
      data: {
        title: body.title,
        content: body.content,
        tags: {
          set: body.tags,
        },
      },
      select: articleSelect,
    });

    return article;
  }
}

export default createHandler(AdminRouter);
