import {
  AdminPermission,
  EmployeeRole,
  NotificationType,
  PunishmentType,
  Role,
} from "@prisma/client";
import {
  Body,
  createHandler,
  Get,
  Param,
  Post,
  Query,
} from "@storyofams/next-api-decorators";
import { promises as fs, readFileSync } from "fs";
import { PrefCategory } from "../../../components/Admin/Pages/Instance";
import { AdminAction } from "../../../util/adminAction";
import Authorized, {
  Account,
  AdminAuthorized,
} from "../../../util/api/authorized";
import { sendMail } from "../../../util/mail";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";
import {
  nonCurrentUserSelect,
  userSelect,
  articleSelect,
} from "../../../util/prisma-types";
import { RateLimitMiddleware } from "../../../util/rateLimit";
import { setEnvVar } from "@soodam.re/env-utils";
import { join } from "path";
import createNotification from "../../../util/notifications";
import { z } from "zod";

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
        otpAscii: true,
        otpAuthUrl: true,
        otpBase32: true,
        otpEnabled: true,
        otpHex: true,
      },
      take: 8,
      skip: Number(page) * 8,
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  }

  @Post("/users/:id/permissions/update")
  @AdminAuthorized()
  public async updatePermissions(
    @Param("id") id: string,
    @Body() permissions: AdminPermission[]
  ) {
    const user = await prisma.user.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: {
        adminPermissions: permissions,
      },
    });

    return {
      success: true,
    };
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
    @Body() body: { reason: string; reportAuthorId?: number; expires?: string },
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
          banExpires: body.expires
            ? new Date(body.expires)
            : new Date("9999-12-31T23:59:59.999Z"),
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

    if (body.reportAuthorId) {
      await prisma.user.update({
        where: {
          id: Number(body.reportAuthorId),
        },
        data: {
          tickets: {
            increment: 250,
          },
        },
      });
      await createNotification(
        Number(body.reportAuthorId),
        NotificationType.SUCCESS,
        `Thank you for your report filed against ${user.username}! Appropriate action has been taken against the offender, and you have been rewarded with 250 tickets.`,
        "Thank You"
      );
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
    @Query("importance") importance: number,
    @Query("userId") userId: number
  ) {
    const activity = await prisma.adminActivityLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUri: true,
          },
        },
      },
      where: {
        ...(importance
          ? {
              importance: {
                gte: Number(importance),
              },
            }
          : {}),
        ...(userId
          ? {
              user: {
                id: Number(userId),
              },
            }
          : {}),
      },
      take: 50,
      ...(page ? { skip: (page - 1) * 50 } : {}),
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
      include: { employee: true },
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
      {
        name: AdminAction.RESET_BIO,
        action: async () => {
          await prisma.user.update({
            where: {
              id: Number(uid),
            },
            data: {
              bio: "This user has not yet written a bio.",
            },
          });

          await createActionLog(`Reset ${user.username}'s bio`, 3);
        },
      },
      {
        name: AdminAction.EDIT_EMPLOYEE,
        action: async () => {
          if (user.role !== Role.ADMIN) {
            return {
              success: false,
              error: "User is not an employee",
            };
          }

          const formSchema = z.object({
            role: z.nativeEnum(EmployeeRole).optional(),
            fullName: z.string().optional(),
            contractExpiresAt: z.date().optional(),
            contactEmail: z.string().email().optional(),
            probationary: z.boolean().optional(),
          });

          const form = formSchema.parse({
            ...body,
            contractExpiresAt: new Date(body.contractExpiresAt),
          });

          if (!user.employee) {
            await prisma.employee.create({
              data: {
                role: form.role!,
                fullName: form.fullName!,
                contractExpiresAt: form.contractExpiresAt!,
                contactEmail: form.contactEmail!,
                probationary: form.probationary!,
                user: {
                  connect: {
                    id: Number(uid),
                  },
                },
              },
            });
          } else {
            await prisma.employee.update({
              where: {
                id: String(user.employee.id),
              },
              data: {
                role: form.role,
                fullName: form.fullName,
                contractExpiresAt: form.contractExpiresAt,
                contactEmail: form.contactEmail,
                probationary: form.probationary,
              },
            });
          }

          await createActionLog(
            `Edited ${user.username}'s employee details`,
            3
          );
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
      select: {
        ...articleSelect,
        viewers: false,
      },
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

    const tagArray = tags
      .flatMap((t) => t.tags)
      .filter((v, i, a) => a.indexOf(v) === i);
    return tagArray;
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

  @Get("/tickets")
  @AdminAuthorized()
  public async getTickets() {
    const tickets = await prisma.supportTicket.findMany({
      where: {
        status: "OPEN",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: nonCurrentUserSelect,
      },
    });

    return tickets;
  }

  @Post("/tickets/close/:id")
  @AdminAuthorized()
  public async closeTicket(@Param("id") id: string) {
    const t = await prisma.supportTicket.update({
      where: {
        id: String(id),
      },
      data: {
        status: "CLOSED",
      },
    });

    sendMail(
      t.contactEmail,
      "Support Ticket Closed",
      `
      <h1>Support Ticket Closed</h1>
      <p>Your support ticket has been closed. If you have any further questions, please contact us again.</p>
      <small>This is an automated message regarding your support ticket (title: ${t.title}).</small>
      `
    );

    return {
      success: true,
    };
  }

  @Get("/prefs/:category")
  @AdminAuthorized()
  public async getPrefs(@Param("category") category: PrefCategory) {
    function getLatest() {
      const data = readFileSync(join(process.cwd(), ".env"), "utf8");
      const lines = data.split("\n");
      const envs = lines
        .filter((l) => !l.startsWith("#"))
        .map((l) => {
          const [key, value] = l.split("=");
          return {
            key: String(key),
            value: String(value),
          };
        });

      return envs;
    }

    const envs = getLatest();

    function getValue(key: string) {
      return envs
        .find((e) => e.key === key)
        ?.value.replace(/"/g, "")
        .replace(/ /g, "");
    }

    const operations = {
      [PrefCategory.Email]: async () => {
        const emailEnvs = [
          "MAIL_ENABLED",
          "SMTP_HOST",
          "SMTP_PASSWORD",
          "SMTP_USERNAME",
          "MAIL_DOMAIN",
        ];
        const emailVars = emailEnvs.map((e) => ({
          key: e,
          value: String(getValue(e)),
        }));
        const map = emailVars.reduce((acc, cur) => {
          acc[String(cur.key!)] = String(cur.value);
          return acc;
        }, {} as Record<string, string>);

        return map;
      },
      [PrefCategory.Flags]: async () => {
        const happykitEnvs = [
          "NEXT_PUBLIC_FLAGS_KEY",
          "NEXT_PUBLIC_FLAGS_PRODUCTION",
          "NEXT_PUBLIC_FLAGS_PREVIEW",
          "NEXT_PUBLIC_FLAGS_DEVELOPMENT",
        ];
        const flagVars = happykitEnvs.map((e) => ({
          key: e,
          value: String(getValue(e)),
        }));

        return flagVars.reduce((acc, cur) => {
          acc[cur.key!] = cur.value;
          return acc;
        }, {} as Record<string, string>);
      },
      [PrefCategory.Integrations]: async () => {
        return [];
      },
    };

    const operation =
      operations[category as PrefCategory] ||
      (() => {
        throw new Error("Invalid category");
      });

    if (!operation) {
      return {
        success: false,
        error: "Invalid category",
      };
    }

    const prefs = await operation();

    return prefs;
  }

  @Post("/prefs/:key")
  @AdminAuthorized()
  public async updateEnv(
    @Param("key") key: string,
    @Body() body: { value: string },
    @Account() user: User
  ) {
    if (
      !user.adminPermissions.includes(AdminPermission.CHANGE_INSTANCE_SETTINGS)
    ) {
      return {
        success: false,
        error:
          "You do not have permission to do this, missing CHANGE_INSTANCE_SETTINGS",
      };
    }

    const { value } = body;

    if (!value) {
      return {
        success: false,
        error: "Value is required",
      };
    }

    const changableEnvs = [
      "MAIL_ENABLED",
      "SMTP_HOST",
      "SMTP_PASSWORD",
      "SMTP_USERNAME",
      "MAIL_DOMAIN",
      "NEXT_PUBLIC_FLAGS_KEY",
      "NEXT_PUBLIC_FLAGS_PRODUCTION",
      "NEXT_PUBLIC_FLAGS_PREVIEW",
      "NEXT_PUBLIC_FLAGS_DEVELOPMENT",
    ];

    if (!changableEnvs.includes(key)) {
      return {
        success: false,
        error: "Invalid key - not changable",
      };
    }

    try {
      setEnvVar(process.cwd() + "/.env", key, value);
    } catch (e: any) {
      return {
        success: false,
        error: e.message || "Unknown error writing to .env file",
      };
    }

    return {
      success: true,
    };
  }

  @Get("/admins")
  @Authorized()
  public async getAdmins() {
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
        username: true,
        avatarUri: true,
      },
    });

    return admins;
  }

  @Post("/log/impersonate")
  @AdminAuthorized()
  public async logImpersonation(
    @Body() body: { userId: number; reason: string },
    @Account() user: User
  ) {
    const { userId, reason } = body;

    if (!userId) {
      return {
        success: false,
        error: "User ID is required",
      };
    }

    const targetUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    await prisma.adminActivityLog.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        activity: `Impersonated user ${userId} (${targetUser?.username}) for ${reason}`,
        importance: 4,
      },
    });

    return { success: true };
  }

  @Get("/directory")
  @AdminAuthorized()
  public async getDirectory(
    @Query("search") search?: string,
    @Query("role") role?: EmployeeRole
  ) {
    const users = await prisma.employee.findMany({
      where: {
        ...(search
          ? {
              user: {
                OR: [
                  {
                    employee: {
                      fullName: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    username: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            }
          : {}),
        ...(role ? { role } : {}),
      },
      select: {
        id: true,
        fullName: true,
        contactEmail: true,
        role: true,
        probationary: true,
        contractExpiresAt: true,
        createdAt: true,
        user: {
          select: nonCurrentUserSelect.select,
        },
      },
    });

    return users;
  }
}

export default createHandler(AdminRouter);
