import { PrefCategory } from "@/components/admin/pages/instance";
import { AdminViewUser } from "@/components/admin/pages/users";
import type { ReportCategory } from "@/components/report-user";
import { notificationMetadata } from "@/data/notification-metadata";
import IResponseBase from "@/types/api/IResponseBase";
import { AdminAction } from "@/util/admin-action";
import Authorized, { Account, AdminAuthorized } from "@/util/api/authorized";
import cast from "@/util/cast";
import { PREMIUM_PAYOUTS } from "@/util/constants";
import generateGiftCode from "@/util/gift-codes";
import { hashPass } from "@/util/hash/password";
import { sendMail } from "@/util/mail";
import createNotification from "@/util/notifications";
import prisma from "@/util/prisma";
import type { NonUser, User } from "@/util/prisma-types";
import {
  articleSelect,
  nonCurrentUserSelect,
  userSelect,
} from "@/util/prisma-types";
import { RateLimitMiddleware } from "@/util/rate-limit";
import { getOperatingSystem } from "@/util/ua";
import {
  AdminPermission,
  AutomodTrigger,
  EmployeeRole,
  GiftCodeGrant,
  NotificationType,
  OperatingSystem,
  PremiumSubscriptionType,
  Prisma,
  PunishmentType,
  Role,
  UserReportState,
} from "@prisma/client";
import { render } from "@react-email/render";
import {
  BadRequestException,
  Body,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  createHandler,
} from "@solariusnl/next-api-decorators";
import { setEnvVar } from "@soodam.re/env-utils";
import { randomUUID } from "crypto";
import AccountUpdate from "email/emails/account-update";
import JoinFramework from "email/emails/join-framework";
import StaffEmail from "email/emails/staff-email";
import SupportTicketClosed from "email/emails/support-ticket-closed";
import { promises as fs, readFileSync } from "fs";
import type { NextApiRequest } from "next";
import { join } from "path";
import { z } from "zod";

export type AutomodTriggerWithUser = AutomodTrigger & {
  user: NonUser;
};

const adminUserSelect = {
  ...userSelect,
  sessions: true,
  discordAccount: true,
  protected: true,
  notifications: {
    where: {
      seen: false,
    },
  },
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
  previousEmails: true,
  locked: true,
  recentIp: true,
  recentIpGeo: true,
};

class AdminRouter {
  @Get("/reports")
  @AdminAuthorized()
  public async getReports(
    @Query("page") page: number,
    @Query("sort") sort: "reviewed" | "unreviewed" | "all" = "all",
    @Query("reason") reason: ReportCategory | "all" = "all"
  ) {
    const reports = await prisma.userReport.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      include: {
        user: nonCurrentUserSelect,
        author: nonCurrentUserSelect,
      },
      skip: (page - 1) * 12,
      where: {
        processed:
          sort === "reviewed"
            ? true
            : sort === "unreviewed"
            ? false
            : undefined,
        reason: reason ? reason : undefined,
      },
    });
    const count = await prisma.userReport.count({
      where: {
        processed:
          sort === "reviewed"
            ? true
            : sort === "unreviewed"
            ? false
            : undefined,
        reason: reason ? reason : undefined,
      },
    });
    const pages = Math.ceil(count / 12);

    return {
      reports,
      pages,
    };
  }

  @Post("/report/:id/close")
  @AdminAuthorized()
  public async closeReport(@Param("id") id: string, @Body() body: unknown) {
    const report = await prisma.userReport.findFirst({
      where: {
        id: String(id),
      },
      include: {
        user: nonCurrentUserSelect,
      },
    });

    if (!report) {
      return {
        success: false,
        error: "Report not found",
      };
    }

    const schema = z.object({
      state: z.nativeEnum(UserReportState),
    });

    const parsedBody = schema.parse(body);

    await prisma.userReport.update({
      where: {
        id: String(id),
      },
      data: {
        processed: true,
        state: parsedBody.state,
      },
    });

    await createNotification(
      report.authorId,
      NotificationType.REPORT_PROCESSED,
      `Your report against @${report.user.username} has been processed. Please check the report details for more information.`,
      "Report processed",
      <z.infer<typeof notificationMetadata.REPORT_PROCESSED>>{
        reportId: report.id,
        state: parsedBody.state,
      }
    );

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

    const latestThreeUsers = await prisma.user.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        ...nonCurrentUserSelect.select,
        email: true,
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
        latestThreeUsers,
      },
      games: {
        totalGames: await prisma.game.count(),
      },
    };
  }

  @Get("/invites")
  @AdminAuthorized()
  public async getInvites() {
    const invites = await prisma.invite.findMany({
      include: {
        createdBy: nonCurrentUserSelect,
      },
    });
    return invites;
  }

  @Post("/invites/new/:amount")
  @AdminAuthorized()
  public async createInvite(
    @Param("amount") amount: number,
    @Body() body: unknown,
    @Account() user: User
  ) {
    if (amount < 1 || amount > 500) {
      return {
        success: false,
        error: "Amount must be between 1 and 500",
      };
    }

    const bodySchema = z.object({
      email: z.string().optional(),
    });

    const req = bodySchema.parse(body);

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
        ...(req.email ? { sentToEmail: req.email } : {}),
        createdById: user.id,
      })),
    });

    if (req.email) {
      sendMail({
        to: req.email,
        subject: "Join Framework",
        html: render(
          JoinFramework({
            code: keys[0],
          }) as React.ReactElement
        ),
      });
    }

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
        "utf8"
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
        email: true,
        username: true,
        role: true,
        banned: true,
        avatarUri: true,
        alias: true,
        id: true,
      },
      take: 8,
      skip: Number(page) * 8,
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  }

  @Get("/user/:uid")
  @AdminAuthorized()
  public async getUserById(@Param("uid") uid: number) {
    const user = await prisma.user.findFirst({
      where: {
        id: Number(uid),
      },
      select: adminUserSelect,
    });

    return <IResponseBase<{ user: AdminViewUser }>>{
      success: true,
      data: {
        user: cast<AdminViewUser>(user),
      },
    };
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
    @Body()
    body: {
      reason: string;
      reportAuthorId?: number;
      expires?: string;
      internalNote?: string;
      scrubUsername?: boolean;
    },
    @Account() admin: User
  ) {
    if (body.reason.length < 3 || body.reason.length > 1024) {
      return {
        success: false,
        error: "Reason must be between 3 and 1024 characters",
      };
    }
    if (body.internalNote && body.internalNote.length > 1024) {
      return {
        success: false,
        error: "Internal note must be less than 1024 characters",
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
    }

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
        ...(body.internalNote && { internalNote: body.internalNote }),
      },
    });

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
        NotificationType.GIFT,
        `Thank you for your report filed against ${user.username}! Appropriate action has been taken against the offender, and you have been rewarded with 250 tickets.`,
        "Thank you"
      );
    }

    sendMail({
      to: user.email,
      subject: "Enforcement Action Notice",
      html: render(
        AccountUpdate({
          content: `Hello ${user.username},<br /><br />You have been ${
            category === "ban" ? "banned" : "warned"
          } on Framework.<br /><br />${
            category === "ban"
              ? `Expires: <b>${new Date(
                  body.expires!
                ).toLocaleString()}</b><br />Reason: <b>${body.reason}</b>`
              : `Reason: ${body.reason}`
          }<br /><br />If you believe this is a mistake, please contact us at our support portal.`,
        }) as React.ReactElement
      ),
    });

    if (body.scrubUsername && body.scrubUsername === true) {
      const random = randomUUID().split("-").shift();
      await prisma.user.update({
        where: {
          id: Number(uid),
        },
        data: {
          username: `[Deleted - ${random}]`,
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
    @Query("importance") importance: number,
    @Query("userId") userId: number
  ) {
    const where = {
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
    };
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
      where,
      take: 50,
      ...(page ? { skip: (page - 1) * 50 } : {}),
    });
    const count = await prisma.adminActivityLog.count({
      where,
    });

    return {
      success: true,
      activity,
      pages: Math.ceil(count / 50),
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
              id: Number(user.id),
            },
            data: {
              tickets: {
                [body.type]: body.amount,
              },
            },
          });

          await createActionLog(
            `Adjusted ${user.username}'s tickets to ${body.amount} by type ${body.type}`,
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
          sendMail({
            to: user.email,
            subject: "Username Reset",
            html: render(
              AccountUpdate({
                content: `Our staff have reset your username to ${username}. Please use this username to login to your account, and if you wish to change it, you can do so in your account settings.`,
              }) as React.ReactElement
            ),
          });
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
          sendMail({
            to: user.email,
            subject: "Email Reset",
            html: render(
              AccountUpdate({
                content:
                  "Our staff have reset your email address. You will be asked to enter a new email address when you access Framework.",
              }) as React.ReactElement
            ),
          });
        },
      },
      {
        name: AdminAction.RESET_PASSWORD,
        action: async () => {
          const randomPassword =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
          const salted = await hashPass(randomPassword);

          await prisma.user.update({
            where: {
              id: Number(uid),
            },
            data: {
              password: salted,
              sessions: {
                deleteMany: {},
              },
            },
          });

          await createActionLog(`Reset ${user.username}'s password`, 3);
          sendMail({
            to: user.email,
            subject: "Password Reset",
            html: render(
              AccountUpdate({
                content: `Your password has been changed by a Framework staff member. See below for your new password:<br /><br />Password: <b>${randomPassword}</b><br /><br />As soon as you can, please change your password in your account settings.`,
              }) as React.ReactElement
            ),
          });
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
      {
        name: AdminAction.ADJUST_SUBSCRIPTION,
        action: async () => {
          const subscriptionSchema = z.object({
            type: z.nativeEnum(PremiumSubscriptionType).optional(),
            renew: z.date().optional(),
          });

          const subscription = subscriptionSchema.parse({
            ...body,
            renew: new Date(body.renew),
          });

          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              premiumSubscription: {
                upsert: {
                  create: {
                    type:
                      subscription.type! ||
                      PremiumSubscriptionType.PREMIUM_ONE_MONTH,
                  },
                  update: {
                    type: subscription.type!,
                  },
                },
              },
              premium: true,
              // if user didnt already have premium, dont do
              ...(user.premium
                ? {}
                : {
                    tickets: {
                      increment: PREMIUM_PAYOUTS[subscription.type!],
                    },
                  }),
            },
          });

          await createActionLog(`Adjusted ${user.username}'s subscription`, 3);
          if (!user.premium) {
            await createNotification(
              user.id,
              NotificationType.GIFT,
              `Welcome to Framework Premium. You've received your first payout of ${
                PREMIUM_PAYOUTS[subscription.type!]
              } tickets! Thank you for supporting us.`,
              "Welcome to Premium"
            );
          }
        },
      },
      {
        name: AdminAction.UNBAN,
        action: async () => {
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              banned: false,
              banReason: "",
            },
          });

          await createActionLog(`Unbanned ${user.username}`, 3);
          sendMail({
            to: user.email,
            subject: "Unbanned",
            html: render(
              AccountUpdate({
                content:
                  "You've been unbanned from Framework. You can now access your account again.",
              }) as React.ReactElement
            ),
          });
        },
      },
      {
        name: AdminAction.UNWARN,
        action: async () => {
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              warningViewed: false,
              warning: "",
            },
          });

          await createActionLog(`Unwarned ${user.username}`, 2);
        },
      },
      {
        name: AdminAction.SEND_EMAIL,
        action: async () => {
          const emailSchema = z.object({
            subject: z.string(),
            content: z.string(),
          });

          const email = emailSchema.parse(body);

          if (!account.employee) {
            return {
              success: false,
              error:
                "User is not an employee, and lacks proper profile information to send emails",
            };
          }

          sendMail({
            to: user.email,
            subject: email.subject,
            html: render(
              StaffEmail({
                subject: email.subject,
                content: email.content,
                contact: account.employee.contactEmail,
                sender: account.employee.fullName,
              }) as React.ReactElement
            ),
          });

          await createActionLog(`Sent email to ${user.username}`, 2);
        },
      },
      {
        name: AdminAction.ADJUST_VERIFICATION,
        action: async () => {
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              verified: !user.verified,
              banReason: "",
            },
          });

          await createActionLog(`Adjusted ${user.username} verification`, 3);
        },
      },
      {
        name: AdminAction.ADJUST_PROTECTED,
        action: async () => {
          if (!account.adminPermissions.includes(AdminPermission.PROTECT_USERS))
            return {
              success: false,
              error: "You do not have permission to execute this action",
            };
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              protected: !user.protected,
            },
          });

          await createActionLog(
            `Adjusted ${user.username} protection status`,
            4
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

  @Get("/tickets/:page")
  @AdminAuthorized()
  public async getTickets(
    @Param("page") page: string,
    @Query("status") status: "OPEN" | "CLOSED" | "ALL" = "ALL",
    @Query("filter")
    filter: "CLAIMED_BY_ME" | "CLAIMED" | "UNCLAIMED" | "ALL" = "ALL",
    @Account() user: User
  ) {
    const where: Prisma.SupportTicketWhereInput = {
      status: status === "ALL" ? undefined : status,
      ...(filter === "CLAIMED_BY_ME"
        ? {
            claimedBy: {
              id: Number(user.id),
            },
          }
        : {}),
      ...(filter === "CLAIMED"
        ? {
            NOT: {
              claimedBy: null,
            },
          }
        : {}),
      ...(filter === "UNCLAIMED"
        ? {
            claimedBy: null,
          }
        : {}),
    };

    const tickets = await prisma.supportTicket.findMany({
      where: where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: nonCurrentUserSelect,
        claimedBy: nonCurrentUserSelect,
      },
      take: 27,
      skip: (Number(page) - 1) * 27,
    });
    const count = await prisma.supportTicket.count({
      where: where,
    });

    return {
      tickets,
      pages: Math.ceil(count / 27),
    };
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

    sendMail({
      to: t.contactEmail,
      subject: "Support Ticket Closed",
      html: render(
        SupportTicketClosed({
          title: t.title,
        }) as React.ReactElement
      ),
    });

    return {
      success: true,
    };
  }

  @Post("/tickets/claim/:id")
  @AdminAuthorized()
  public async claimTicket(@Param("id") id: string, @Account() account: User) {
    const t = await prisma.supportTicket.findFirst({
      where: {
        id: String(id),
      },
      include: {
        claimedBy: true,
      },
    });

    if (!t) {
      return {
        success: false,
        error: "Invalid ticket",
      };
    }

    if (t.claimedBy) {
      return {
        success: false,
        error: "Ticket already claimed",
      };
    }

    await prisma.supportTicket.update({
      where: {
        id: String(id),
      },
      data: {
        claimedBy: {
          connect: {
            id: Number(account.id),
          },
        },
      },
    });

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
    @Account() user: User,
    @Request() request: NextApiRequest
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

    const session = await prisma.session.create({
      data: {
        user: {
          connect: {
            id: Number(userId),
          },
        },
        token: Array(12)
          .fill(0)
          .map(() => Math.random().toString(36).substring(2))
          .join(""),
        ip: "N/A",
        ua: String(request.headers["user-agent"] || "Unknown"),
        os: OperatingSystem[
          getOperatingSystem(
            String(request.headers["user-agent"]) || ""
          ) as keyof typeof OperatingSystem
        ],
        impersonation: true,
      },
    });

    await createNotification(
      userId,
      NotificationType.ALERT,
      `You have been impersonated by ${user.username} for ${reason}. This was done by a Solarius staff member. If you did not authorize this, please contact us immediately.`,
      "Impersonation"
    );

    return { success: true, token: session.token };
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
        bio: true,
        skills: true,
      },
    });

    return users;
  }

  @Post("/employee/update")
  @AdminAuthorized()
  public async updateEmployee(@Account() user: User, @Body() body: unknown) {
    const updatable = [
      {
        path: "bio",
        validate: (v: unknown) =>
          typeof v === "string" && v.length < 300 && v.length > 0,
        error: "Bio must be between 1 and 300 characters",
      },
      {
        path: "skills",
        validate: (v: unknown) =>
          Array.isArray(v) && v.every((s) => typeof s === "string"),
        error: "Skills must be an array of strings",
      },
    ];

    const errors: string[] = [];

    for (const u of updatable) {
      const value = (body as any)[u.path];

      if (value) {
        if (!u.validate(value)) {
          errors.push(u.error);
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          errors,
        };
      }
    }

    if ((body as any).skills) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          employee: {
            update: {
              skills: {
                set: [],
              },
            },
          },
        },
      });
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        employee: {
          update: {
            bio: (body as any).bio,
            ...((body as any).skills
              ? {
                  skills: {
                    set: (body as any).skills,
                  },
                }
              : {}),
          },
        },
      },
    });
  }

  @Get("/gifts")
  @AdminAuthorized()
  public async getGifts(
    @Query("filter")
    filter: "unused" | "used" | "all" | "premium" | "tickets" = "all",
    @Query("sort") sort: "newest" | "oldest" = "newest",
    @Query("page") page = 1
  ) {
    const where: Prisma.GiftCodeWhereInput = {
      ...(filter === "unused"
        ? {
            redeemed: false,
          }
        : {}),
      ...(filter === "used"
        ? {
            redeemed: true,
          }
        : {}),
      ...(filter === "premium"
        ? {
            grant: {
              in: [
                GiftCodeGrant.PREMIUM_ONE_MONTH,
                GiftCodeGrant.PREMIUM_SIX_MONTHS,
                GiftCodeGrant.PREMIUM_ONE_YEAR,
              ],
            },
          }
        : {}),
      ...(filter === "tickets"
        ? {
            grant: {
              in: [
                GiftCodeGrant.THOUSAND_TICKETS,
                GiftCodeGrant.TWOTHOUSAND_TICKETS,
                GiftCodeGrant.FIVETHOUSAND_TICKETS,
                GiftCodeGrant.SIXTEENTHOUSAND_TICKETS,
              ],
            },
          }
        : {}),
    };

    const codes = await prisma.giftCode.findMany({
      where,
      orderBy: {
        createdAt: sort === "newest" ? "desc" : "asc",
      },
      skip: (page - 1) * 25,
      take: 25,
      include: {
        redeemedBy: nonCurrentUserSelect,
        createdBy: nonCurrentUserSelect,
      },
    });

    const count = await prisma.giftCode.count({
      where,
    });

    return {
      codes,
      pages: Math.ceil(count / 25),
    };
  }

  @Post("/gifts/:grant")
  @AdminAuthorized()
  public async createGiftCode(
    @Param("grant") grant: GiftCodeGrant,
    @Account() admin: User
  ) {
    const code = generateGiftCode();
    const gift = await prisma.giftCode.create({
      data: {
        grant,
        redeemedAt: new Date(),
        code,
        createdBy: {
          connect: {
            id: admin.id,
          },
        },
      },
    });

    await prisma.adminActivityLog.create({
      data: {
        user: {
          connect: {
            id: Number(admin.id),
          },
        },
        activity: `Created a gift code with grant ${grant}`,
        importance: 2,
      },
    });

    return {
      success: true,
      gift,
    };
  }

  @Delete("/gifts/:id")
  @AdminAuthorized()
  public async deleteGiftCode(@Param("id") id: string, @Account() admin: User) {
    const res = await prisma.giftCode.findFirst({
      where: {
        id,
      },
    });

    if (!res) {
      throw new BadRequestException("Invalid code");
    }

    await prisma.giftCode.delete({
      where: {
        id,
      },
    });

    await prisma.adminActivityLog.create({
      data: {
        user: {
          connect: {
            id: admin.id,
          },
        },
        activity: `Deleted gift code with grant ${res.grant}`,
        importance: 2,
      },
    });

    return {
      success: true,
    };
  }

  @Get("/automod")
  @AdminAuthorized()
  public async getAutomod(@Query("page") page = 1) {
    const automod = await prisma.automodTrigger.findMany({
      skip: (page - 1) * 25,
      take: 25,
      include: {
        user: {
          select: nonCurrentUserSelect.select,
        },
      },
    });

    const count = await prisma.automodTrigger.count();

    return {
      success: true,
      data: {
        automod,
        pages: Math.ceil(count / 25),
      },
    };
  }

  @Delete("/automod/:id")
  @AdminAuthorized()
  public async deleteAutomod(
    @Param("id") id: string,
    @Account() admin: User
  ): Promise<{ success: boolean }> {
    const res = await prisma.automodTrigger.findFirst({
      where: {
        id,
      },
    });

    if (!res) {
      throw new BadRequestException("Invalid trigger");
    }

    await prisma.automodTrigger.delete({
      where: {
        id,
      },
    });

    await prisma.adminActivityLog.create({
      data: {
        user: {
          connect: {
            id: admin.id,
          },
        },
        activity: `Deleted automod trigger with id ${id}`,
        importance: 2,
      },
    });

    return {
      success: true,
    };
  }

  @Post("/lock/:uid")
  @AdminAuthorized()
  public async lockUser(
    @Param("uid") uid: string,
    @Account() admin: User
  ): Promise<{ success: boolean }> {
    const user = await prisma.user.findFirst({
      where: {
        id: Number(uid),
      },
    });

    if (!user) {
      throw new BadRequestException("Invalid user");
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        locked: !user.locked,
      },
    });

    await prisma.adminActivityLog.create({
      data: {
        user: {
          connect: {
            id: admin.id,
          },
        },
        activity: `Locked user account with uid ${uid}`,
        importance: 2,
      },
    });

    return <IResponseBase>{
      success: true,
    };
  }
}

export default createHandler(AdminRouter);
