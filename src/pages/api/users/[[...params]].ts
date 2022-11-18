import { NotificationType, ReceiveNotification } from "@prisma/client";
import {
  Body,
  createHandler,
  Get,
  Param,
  Post,
  Query,
} from "@storyofams/next-api-decorators";
import { category } from "../../../components/ReportUser";
import countries from "../../../data/countries";
import getTimezones from "../../../data/timezones";
import Authorized, { Account } from "../../../util/api/authorized";
import { hashPass, isSamePass } from "../../../util/hash/password";
import createNotification from "../../../util/notifications";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";
import { nonCurrentUserSelect } from "../../../util/prisma-types";
import { RateLimitMiddleware } from "../../../util/rateLimit";
import { verificationEmail } from "../../../util/templates/verification-email";
import { logTransaction } from "../../../util/transactionHistory";

interface UserUpdateBody {
  username?: string;
  country?: string;
  busy?: boolean;
}

interface ChangePasswordBody {
  oldPassword: string;
  newPassword: string;
}

interface ChangeEmailBody {
  newEmail: string;
}

class UserRouter {
  @Get("/@me")
  @Authorized()
  public async getMe(@Account() user: User) {
    return user;
  }

  @Post("/@me/verifyemail")
  @Authorized()
  @RateLimitMiddleware(2)()
  public async sendVerificationEmail(@Account() user: User) {
    if (user.emailVerified) {
      return {
        status: 400,
        message: "Users email is already verified",
      };
    }

    if (process.env.MAIL_ENABLED === "true") {
      await verificationEmail(user.id, user.email);
    } else {
      return {
        status: 400,
        message: "Email verification is not enabled on this Framework instance",
      };
    }
  }

  @Post("/@me/changepassword")
  @Authorized()
  @RateLimitMiddleware(2)()
  public async changePassword(
    @Account() user: User,
    @Body() data: ChangePasswordBody
  ) {
    const { oldPassword, newPassword } = data;
    const newPasswordHash = await hashPass(newPassword);

    if (!oldPassword || !newPassword) {
      return {
        status: 400,
        message: "Missing oldPassword or newPassword",
      };
    }

    if (oldPassword === newPasswordHash) {
      return {
        status: 400,
        message: "New password is the same as the current password",
      };
    }

    if (!(await isSamePass(oldPassword, user.password))) {
      return {
        status: 400,
        message: "Old password is not correct",
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await hashPass(newPassword) },
    });

    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    return {
      success: true,
      message: "Password changed successfully",
    };
  }

  @Post("/@me/changeemail")
  @Authorized()
  @RateLimitMiddleware(2)()
  public async changeEmail(
    @Account() user: User,
    @Body() data: ChangeEmailBody
  ) {
    const { newEmail } = data;

    if (!newEmail) {
      return {
        status: 400,
        message: "Missing newEmail",
      };
    }

    if (user.email === newEmail) {
      return {
        status: 400,
        message: "New email is the same as the current email",
      };
    }

    const userExists = await prisma.user.findFirst({
      where: { email: newEmail },
    });

    if (userExists) {
      return {
        status: 400,
        message: "User with this email already exists",
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail, emailVerified: false },
    });

    if (process.env.MAIL_ENABLED === "true") {
      await verificationEmail(user.id, newEmail);
    }

    return {
      success: true,
      message: "Email changed successfully",
    };
  }

  @Post("/@me/warning/acknowledge")
  @Authorized()
  public async acknowledgeWarning(@Account() user: User) {
    await prisma.user.update({
      where: { id: user.id },
      data: { warningViewed: false, warning: "" },
    });

    return {
      success: true,
      message: "Warning acknowledged",
    };
  }

  @Post("/:id/report")
  @Authorized()
  @RateLimitMiddleware(5)()
  public async reportUser(
    @Account() user: User,
    @Body() data: { reason: string; description: string },
    @Param("id") id: number
  ) {
    const { reason, description } = data;

    if (
      !reason ||
      !description ||
      description.length > 800 ||
      !Object.keys(category).find((c) => c === reason)
    ) {
      return {
        success: false,
        message: "Invalid report",
      };
    }

    if (user.id == id) {
      return {
        success: false,
        message: "You cannot report yourself",
      };
    }

    const reportingUser = await prisma.user.findFirst({
      where: { id: Number(id) },
    });

    if (!reportingUser) {
      return {
        success: false,
        message: "User not found",
      };
    }

    await prisma.userReport.create({
      data: {
        user: { connect: { id: reportingUser.id } },
        author: { connect: { id: user.id } },
        reason,
        description,
      },
    });

    const adminsToNotify = await prisma.user.findMany({
      where: { notificationPreferences: { has: "ADMIN_REPORTS" } },
    });

    adminsToNotify.forEach(async (admin) => {
      await createNotification(
        admin.id,
        NotificationType.INFO,
        `There is a new report to review for ${reportingUser.username}. Please review it as soon as possible.`,
        "New Report"
      );
    });

    return {
      success: true,
      message: "User reported successfully",
    };
  }

  @Get("/@me/transactions/:page")
  @Authorized()
  public async getTransactions(
    @Account() user: User,
    @Param("page") page: number
  ) {
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      skip: (page - 1) * 10,
    });

    return transactions;
  }

  @Post("/:id/follow")
  @Authorized()
  @RateLimitMiddleware(50)()
  public async followUser(@Account() user: User, @Param("id") id: number) {
    const followingUser = await prisma.user.findFirst({
      where: { id: Number(id) },
      include: {
        followers: true,
      },
    });

    if (!followingUser) {
      return {
        success: false,
        message: "User not found",
      };
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        following: {
          ...(followingUser.followers.find((f) => f.id == user.id)
            ? { disconnect: { id: followingUser.id } }
            : { connect: { id: followingUser.id } }),
        },
      },
    });

    return {
      success: true,
      message: `User ${
        followingUser.followers.find((f) => f.id == user.id) ? "un" : ""
      }followed successfully`,
    };
  }

  @Post("/:id/donate/:amount")
  @Authorized()
  @RateLimitMiddleware(5)()
  public async donate(
    @Account() user: User,
    @Param("id") id: number,
    @Param("amount") amount: number
  ) {
    const donatingUser = await prisma.user.findFirst({
      where: { id: Number(id) },
    });

    if (!donatingUser) {
      return {
        success: false,
        message: "User not found",
      };
    }

    if (amount <= 0 || amount % 1 !== 0) {
      return {
        success: false,
        message: "Invalid amount",
      };
    }

    if (user.tickets < amount) {
      return {
        success: false,
        message: "You do not have enough tickets",
      };
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        tickets: {
          decrement: Number(amount),
        },
      },
    });

    await prisma.user.update({
      where: {
        id: donatingUser.id,
      },
      data: {
        tickets: {
          increment: Number(amount),
        },
      },
    });

    await logTransaction(
      donatingUser.username,
      amount,
      `Donation to ${donatingUser.username} (ID: ${donatingUser.id})`,
      user.id
    );

    if (user.notificationPreferences.includes("SENT_DONATION")) {
      await createNotification(
        user.id,
        "SUCCESS",
        `You have donated ${amount} tickets to @${donatingUser.username}.`,
        "Donation Success"
      );
    }

    if (donatingUser.notificationPreferences.includes("RECEIVED_DONATION")) {
      await createNotification(
        donatingUser.id,
        "SUCCESS",
        `You have received ${amount} tickets from @${user.username}!`,
        "New Donation"
      );
    }

    return {
      success: true,
      message: "Donation successful",
    };
  }

  @Post("/@me/update")
  @Authorized()
  @RateLimitMiddleware(20)()
  public async updateUser(@Account() user: User, @Body() data: UserUpdateBody) {
    const updatable = [
      {
        name: "username",
        verify: async (value: any) => {
          if (!value.match(/^[a-zA-Z0-9_]{3,24}$/)) {
            return false;
          }

          const userExists = await prisma.user.findFirst({
            where: {
              username: String(value),
              previousUsernames: { has: value },
            },
          });

          if (
            userExists ||
            user.tickets < 500 ||
            new Date(user.lastUsernameChange as Date).getTime() >
              new Date().getTime() - 604800000
          ) {
            return false;
          }

          await prisma.user.update({
            where: { id: user.id },
            data: {
              tickets: { decrement: 500 },
              previousUsernames: {
                push: user.username,
              },
              lastUsernameChange: new Date(),
            },
          });

          await logTransaction(
            "Username change",
            500,
            `Username change to ${value}`,
            user.id
          );

          return true;
        },
        error:
          "Username must be between 3 and 24 characters, and can only contain letters, numbers, and underscores. You may only change your username once every 24 hours, and it costs 500 tickets.",
      },
      {
        name: "country",
        verify: async (value: string) =>
          countries.find((c) => c.code === value),
        error: "Invalid country",
      },
      {
        name: "bio",
        error: "Bio must be less than 1024 characters",
        verify: (value: string) =>
          value.replace(/(\r\n|\n|\r)/gm, "").length <= 1024,
      },
      {
        name: "busy",
        regex: /^(true|false)$/,
        error: "Busy must be true or false",
      },
      {
        name: "notificationPreferences",
        verify: async (value: any) => {
          if (!Array.isArray(value)) return false;
          for (const v of value) {
            if (!Object.keys(ReceiveNotification).includes(v)) return false;
          }

          if (value.includes("ADMIN_REPORTS") && user.role !== "ADMIN") {
            return false;
          }

          return true;
        },
        error: "Invalid notification preferences",
      },
      {
        name: "timeZone",
        verify: async (value: any) => {
          if (getTimezones().filter((t) => t.value === value)) return true;

          return false;
        },
        error: "Invalid timezone",
      },
      {
        name: "alias",
        verify: async (value: any) => {
          if (!value.match(/^[a-zA-Z0-9_]{3,24}$/)) return false;

          return true;
        },
        error: "Invalid alias",
      },
      {
        name: "emailRequiredLogin",
        verify: async (value: any) => {
          if (typeof value !== "boolean") return false;
          if (!user.emailVerified) return false;

          return true;
        },
        error: "You must verify your email before modifying this setting",
      },
    ];

    for (const field of updatable) {
      if (data[field.name as keyof UserUpdateBody]) {
        if (field.regex) {
          if (
            !field.regex.test(
              data[field.name as keyof UserUpdateBody] as string
            )
          ) {
            return {
              error: field.error,
              status: 400,
            };
          }
        } else {
          if (
            !(await field.verify(
              data[field.name as keyof UserUpdateBody] as string
            ))
          ) {
            return {
              error: field.error,
              status: 400,
            };
          }
        }
      }
    }

    await prisma.user.update({
      where: {
        id: Number(user.id),
      },
      data: {
        ...Object.fromEntries(
          Object.entries(data).filter(([key]) =>
            updatable.map(({ name }) => name).includes(key)
          )
        ),
      },
    });

    return {
      success: true,
      message: "User updated successfully.",
    };
  }

  @Post("/@me/preview/enroll")
  @Authorized()
  public async enrollInPreview(@Account() user: User) {
    if (user.enrolledInPreview) {
      return {
        success: false,
        message: "You are already enrolled in the preview.",
      };
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        enrolledInPreview: true,
      },
    });

    return {
      success: true,
      message: "You have successfully enrolled in the preview.",
    };
  }

  @Get("/@me/sessions")
  @Authorized()
  public async getSessions(@Account() user: User) {
    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
    });

    return {
      success: true,
      message: "Sessions retrieved successfully.",
      sessions,
    };
  }

  @Get("/search")
  @Authorized()
  @RateLimitMiddleware(100)()
  public async searchUsers(@Account() user: User, @Query("q") query: string) {
    if (!query) {
      return {
        success: false,
        message: "No query provided",
      };
    }

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: "insensitive",
        },
      },
      take: 10,
      ...nonCurrentUserSelect,
    });

    return users;
  }
}

export default createHandler(UserRouter);
