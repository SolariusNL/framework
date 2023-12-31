import { parse } from "@/components/render-markdown";
import countries from "@/data/countries";
import getTimezones from "@/data/timezones";
import IResponseBase from "@/types/api/IResponseBase";
import Authorized, { Account } from "@/util/api/authorized";
import registerAutomodHandler from "@/util/automod";
import { exclude } from "@/util/exclude";
import { Fwx } from "@/util/fwx";
import { hashPass, isSamePass } from "@/util/hash/password";
import { sendMail } from "@/util/mail";
import createNotification from "@/util/notifications";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import { nonCurrentUserSelect } from "@/util/prisma-types";
import { RateLimitMiddleware } from "@/util/rate-limit";
import { verificationEmail } from "@/util/templates/verification-email";
import { logTransaction } from "@/util/transaction-history";
import {
  UserPreferences,
  defaultUserPreferences,
  userPreferenceValidators,
  userPreferences,
} from "@/util/types";
import {
  Badge,
  Prisma,
  PrivacyPreferences,
  ReceiveNotification,
  TransactionType,
  UserPreferenceUnionType,
} from "@prisma/client";
import { render } from "@react-email/render";
import {
  BadRequestException,
  Body,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  createHandler,
} from "@solariusnl/next-api-decorators";
import AccountUpdate from "email/emails/account-update";
import sanitize from "sanitize-html";

const statusAutomod = registerAutomodHandler("Status update");

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

export type GetUserInventoryAvailabilityResponse = IResponseBase<{
  available: boolean;
}>;

class UserRouter {
  @Get("/@me")
  @Authorized()
  public async getMe(@Account() user: User) {
    return user;
  }

  @Get("/u/:id")
  public async getUser(@Param("id") id: number) {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: nonCurrentUserSelect.select,
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    return user;
  }

  @Get("/by/username/:username")
  public async getUserByUsername(@Param("username") username: string) {
    const user = await prisma.user.findFirst({
      where: { username },
      select: nonCurrentUserSelect.select,
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

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

    await verificationEmail(user.id, user.email);
  }

  @Get("/@me/games")
  @Authorized()
  public async getGames(@Account() user: User) {
    const games = await prisma.game.findMany({
      where: {
        authorId: user.id,
      },
      select: {
        name: true,
        id: true,
        iconUri: true,
        connection: {
          select: {
            ip: true,
          },
        },
      },
    });

    return {
      success: true,
      data: {
        games,
      },
    };
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

    if (!newPassword) {
      return {
        status: 400,
        message: "Missing newPassword",
      };
    }

    if (!user.passwordResetRequired && !oldPassword) {
      return {
        status: 400,
        message: "Missing oldPassword, because passwordResetRequired is false",
      };
    }

    if (oldPassword === newPasswordHash && !user.passwordResetRequired) {
      return {
        status: 400,
        message: "New password is the same as the current password",
      };
    }

    if (
      !user.passwordResetRequired &&
      !(await isSamePass(oldPassword, user.password))
    ) {
      return {
        status: 400,
        message: "Old password is not correct",
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hashPass(newPassword),
        passwordResetRequired: false,
      },
    });

    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    sendMail({
      to: user.email,
      subject: "Password changed",
      html: render(
        AccountUpdate({
          content:
            "Your Framework password has been changed. If you did not authorize this change, please contact support and immediately secure your account.",
        }) as React.ReactElement
      ),
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
      data: {
        email: newEmail,
        emailVerified: false,
        emailResetRequired: false,
        previousEmails: {
          push: user.email,
        },
      },
    });

    await verificationEmail(user.id, newEmail);
    sendMail({
      to: user.email,
      subject: "Email changed",
      html: render(
        AccountUpdate({
          content: `Your Framework email is being changed from <b>${user.email}</b> to <b>${newEmail}</b>. If you did not authorize this change, please contact support and immediately secure your account.`,
        }) as React.ReactElement
      ),
    });

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
    @Body() data: { reason: string; description: string; game?: number },
    @Param("id") id: number
  ) {
    return {
      success: false,
      message: "Deprecated",
    };
  }

  @Get("/@me/transactions")
  @Authorized()
  public async getTransactions(@Account() user: User) {
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        to: nonCurrentUserSelect,
      },
    });

    return transactions;
  }

  @Post("/@me/status")
  @Authorized()
  @RateLimitMiddleware(10)()
  public async updateStatus(
    @Account() user: User,
    @Body()
    data: {
      status: string;
    }
  ) {
    const { status } = data;

    if (!status) {
      return {
        status: 400,
        message: "Missing status",
      };
    }

    if (status.length === 0 || status.length > 1024) {
      return {
        status: 400,
        message: "Status must be between 1 and 1024 characters",
      };
    }

    const s = await prisma.statusPosts.create({
      data: {
        content: sanitize(parse(status), {
          allowedTags: [
            "b",
            "i",
            "u",
            "s",
            "a",
            "p",
            "br",
            "ul",
            "ol",
            "li",
            "h3",
            "h4",
            "strong",
          ],
          allowedAttributes: {
            a: ["href"],
          },
        }),
        createdAt: new Date(),
        user: {
          connect: {
            id: user.id,
          },
        },
      },
      include: {
        user: exclude(nonCurrentUserSelect, ["statusPosts"]),
      },
    });

    statusAutomod(user.id, s.content);

    return {
      success: true,
      status: s,
    };
  }

  @Post("/@me/status/:id/comment")
  @Authorized()
  @RateLimitMiddleware(10)()
  public async commentOnStatus(
    @Account() user: User,
    @Body()
    data: {
      content: string;
    },
    @Param("id") id: string
  ) {
    const { content } = data;

    if (!content) {
      return {
        status: 400,
        message: "Missing content",
      };
    }

    if (content.length === 0 || content.length > 128) {
      return {
        status: 400,
        message: "Content must be between 1 and 128 characters",
      };
    }

    const status = await prisma.statusPosts.findFirst({
      where: { id },
    });

    if (!status) {
      return <IResponseBase>{
        success: false,
        message: "Status not found",
      };
    }

    const comment = await prisma.statusPostComment.create({
      data: {
        content: sanitize(parse(content), {
          allowedTags: [
            "b",
            "i",
            "u",
            "s",
            "a",
            "p",
            "br",
            "ul",
            "ol",
            "li",
            "h3",
            "h4",
            "strong",
          ],
          allowedAttributes: {
            a: ["href"],
          },
        }),
        createdAt: new Date(),
        user: {
          connect: {
            id: user.id,
          },
        },
        post: {
          connect: {
            id: status.id,
          },
        },
      },
      include: {
        user: exclude(nonCurrentUserSelect, ["statusComments"]),
      },
    });

    statusAutomod(user.id, comment.content);

    return <IResponseBase>{
      success: true,
      data: {
        comment,
      },
    };
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

    if (!Number.isInteger(Number(amount))) {
      return {
        success: false,
        message: "Invalid number",
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
        donationCount: {
          increment: 1,
        },
      },
    });
    if (user.donationCount + 1 >= 10)
      await Fwx.Badges.grant(Badge.PHILANTHROPIST, user.id);

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
      amount,
      "Donation to " + donatingUser.username,
      user.id,
      TransactionType.OUTBOUND,
      donatingUser.id
    );
    await logTransaction(
      amount,
      "Donation from " + user.username,
      donatingUser.id,
      TransactionType.INBOUND,
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
              OR: [
                {
                  username: {
                    equals: value,
                    mode: "insensitive",
                  },
                },
                {
                  previousUsernames: {
                    has: value,
                  },
                },
              ],
            },
          });

          if (userExists) {
            return false;
          }

          if (
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
            500,
            "Username change to " + value,
            user.id,
            TransactionType.OUTBOUND,
            undefined,
            "Username Change"
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
        name: "privacyPreferences",
        verify: async (value: any) => {
          if (!Array.isArray(value)) return false;
          for (const v of value) {
            if (!Object.keys(PrivacyPreferences).includes(v)) return false;
          }

          return true;
        },
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
      {
        name: "quickLoginEnabled",
        verify: async (value: any) => {
          if (typeof value !== "boolean") return false;
          return true;
        },
      },
      {
        name: "gettingStartedDismissed",
        verify: async (value: any) => {
          if (typeof value !== "boolean") return false;
          return true;
        },
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

  @Post("/@me/update/links")
  @Authorized()
  @RateLimitMiddleware(20)()
  public async updateProfileLinks(
    @Account() user: User,
    @Body()
    data: Array<{
      name: string;
      url: string;
    }>
  ) {
    if (data.length > 3) {
      return {
        error: "You can only have up to 3 profile links",
        status: 400,
      };
    }

    for (const link of data) {
      if (!link.name.match(/^[a-zA-Z0-9_ ]{3,24}$/)) {
        return {
          error: "Invalid link name",
          status: 400,
        };
      }

      if (
        !link.url.match(
          /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
        )
      ) {
        return {
          error: "Invalid link URL",
          status: 400,
        };
      }
    }

    await prisma.profileLink.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await prisma.profileLink.createMany({
      data: data.map((link) => ({
        name: link.name,
        url: link.url,
        userId: user.id,
      })),
    });

    return {
      success: true,
      message: "Profile links updated successfully.",
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
      include: { oauth: true },
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

  @Delete("/@me/delete")
  @Authorized()
  public async deleteUser(
    @Account() user: User,
    @Body() data: { password: string }
  ) {
    if (!(await isSamePass(data.password, user.password))) {
      return {
        error: "Invalid password",
        status: 400,
        success: false,
      };
    }

    // [
    //   prisma.game,
    //   prisma.session,
    //   prisma.profileLink,
    //   prisma.message,
    //   prisma.checklist,
    //   prisma.avatar,
    //   prisma.gameComment,
    //   prisma.codeSnippet,
    //   prisma.emailVerification,
    //   prisma.nucleusAuthTicket,
    //   prisma.userReport,
    //   prisma.transaction,
    //   prisma.notification,
    //   prisma.premiumSubscription,
    //   prisma.secret,
    //   prisma.emailLoginRequest,
    //   prisma.statusPosts,
    //   prisma.userAdminNotes,
    //   prisma.adminActivityLog,
    // ].forEach(async (model) => {
    //   await (model.deleteMany as any)({
    //     where: {
    //       userId: user.id,
    //     },
    //   });
    // });

    // await prisma.user.delete({
    //   where: {
    //     id: user.id,
    //   },
    // });

    return {
      success: false,
      message: "This endpoint is currently disabled.",
    };
  }

  @Get("/@me/friends/:page")
  @Authorized()
  public async getFriends(
    @Account() user: User,
    @Param("page") page: string,
    @Query("search") search: string = ""
  ) {
    const friends = await prisma.user.findMany({
      where: {
        following: {
          some: {
            id: user.id,
          },
        },
        followers: {
          some: {
            id: user.id,
          },
        },
        username: {
          contains: search,
          mode: "insensitive",
        },
      },
      select: {
        username: true,
        alias: true,
        avatarUri: true,
        role: true,
        id: true,
        lastSeen: true,
        verified: true,
      },
    });

    return {
      success: true,
      message: "Friends retrieved successfully.",
      friends,
    };
  }

  @Get("/@me/pages/friends")
  @Authorized()
  public async getFriendsPages(@Account() user: User) {
    const friends = await prisma.user.count({
      where: {
        following: {
          some: {
            id: user.id,
          },
        },
        followers: {
          some: {
            id: user.id,
          },
        },
      },
    });

    return {
      success: true,
      message: "Friends retrieved successfully.",
      pages: Math.ceil(friends / 5),
    };
  }

  @Get("/:uid/following/:page")
  @Authorized()
  public async getFollowing(
    @Account() user: User,
    @Param("uid") uid: string,
    @Param("page") page: string
  ) {
    const following = await prisma.user.findMany({
      where: {
        followers: {
          some: {
            id: Number(uid),
          },
        },
      },
      take: 10,
      skip: 10 * (Number(page) - 1),
      ...nonCurrentUserSelect,
    });

    return {
      success: true,
      message: "Following retrieved successfully.",
      following,
    };
  }

  @Get("/:uid/followers/:page")
  @Authorized()
  public async getFollowers(
    @Account() user: User,
    @Param("uid") uid: string,
    @Param("page") page: string
  ) {
    const followers = await prisma.user.findMany({
      where: {
        following: {
          some: {
            id: Number(uid),
          },
        },
      },
      take: 10,
      skip: 10 * (Number(page) - 1),
      ...nonCurrentUserSelect,
    });

    return {
      success: true,
      message: "Followers retrieved successfully.",
      followers,
    };
  }

  @Get("/@me/statusposts/:page")
  @Authorized()
  public async getFriendsStatusPosts(
    @Account() user: User,
    @Param("page") page: string
  ) {
    const where: Prisma.UserWhereInput = {
      following: {
        some: {
          id: user.id,
        },
      },
      followers: {
        some: {
          id: user.id,
        },
      },
    };
    const friends = await prisma.user.findMany({
      where,
      ...nonCurrentUserSelect,
    });

    const statusPosts = await prisma.statusPosts.findMany({
      where: {
        userId: {
          in: friends.map((f) => f.id).concat(user.id),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: nonCurrentUserSelect,
        comments: {
          select: {
            user: {
              select: {
                username: true,
                alias: true,
                avatarUri: true,
                role: true,
                id: true,
                verified: true,
              },
            },
            content: true,
            createdAt: true,
            id: true,
          },
        },
      },
      take: 5,
      skip: 5 * (Number(page) - 1),
    });
    const count = await prisma.statusPosts.count({
      where: {
        userId: {
          in: friends.map((f) => f.id).concat(user.id),
        },
      },
    });

    return {
      success: true,
      message: "Friends status posts retrieved successfully.",
      statusPosts,
      pages: Math.ceil(count / 5),
    };
  }

  @Post("/@me/unlock")
  @Authorized()
  public async unlockUser(@Account() user: User) {
    if (!user.banned) {
      return {
        success: false,
        message: "User is not banned.",
      };
    }

    if (new Date(user.banExpires as Date) <= new Date()) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          banned: false,
          banExpires: null,
          banReason: "",
        },
      });

      return {
        success: true,
        message: "User unlocked successfully.",
      };
    } else {
      return {
        success: false,
        message: "User is not eligible to be unlocked yet.",
      };
    }
  }

  @Get("/:uid/pages/following")
  @Authorized()
  public async getFollowingPages(
    @Account() user: User,
    @Param("uid") uid: string
  ) {
    const following = await prisma.user.count({
      where: {
        followers: {
          some: {
            id: Number(uid),
          },
        },
      },
    });

    return {
      success: true,
      message: "Following pages retrieved successfully.",
      pages: Math.ceil(following / 10),
    };
  }

  @Get("/:uid/pages/followers")
  @Authorized()
  public async getFollowersPages(
    @Account() user: User,
    @Param("uid") uid: string
  ) {
    const followers = await prisma.user.count({
      where: {
        following: {
          some: {
            id: Number(uid),
          },
        },
      },
    });

    return {
      success: true,
      message: "Followers pages retrieved successfully.",
      pages: Math.ceil(followers / 10),
    };
  }

  @Post("/@me/subscription/cancel")
  @Authorized()
  public async cancelSubscription(@Account() user: User) {
    await prisma.premiumSubscription.delete({
      where: {
        userId: user.id,
      },
    });

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        premium: false,
      },
    });

    return {
      success: true,
    };
  }

  @Post("/@me/survey/:stars")
  @Authorized()
  public async rateFramework(
    @Account() user: User,
    @Param("stars") stars: number = 0,
    @Body() body: { feedback: string }
  ) {
    if (stars > 5) {
      throw new BadRequestException("Invalid rating range");
    }

    if (body.feedback && body.feedback.length > 500) {
      throw new BadRequestException("Feedback is too long");
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        ...(stars > 0 && {
          ratings: {
            create: {
              rating: Number(stars),
              ...(body.feedback && { feedback: body.feedback }),
            },
          },
        }),
        lastSurvey: new Date(),
      },
    });

    return {
      success: true,
    };
  }

  @Get("/bits")
  @Authorized()
  public async convertBitsToTickets(@Account() user: User) {
    if (user.bits < 100) {
      throw new BadRequestException("Not enough bits");
    }

    const increment =
      Math.floor(user.bits / 100) * 10 + Math.round((user.bits % 100) / 10);
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        tickets: {
          increment,
        },
        bits: {
          decrement: user.bits,
        },
      },
    });

    return {
      success: true,
    };
  }

  @Get("/@me/preferences")
  @Authorized()
  public async getPreferences(@Account() user: User) {
    const prefs = await prisma.userPreference.findMany({
      where: {
        userId: user.id,
      },
    });

    const convertedPrefs = prefs.map((pref) => {
      const prefValue = pref.value;
      switch (pref.valueType) {
        case UserPreferenceUnionType.BOOLEAN:
          return {
            ...pref,
            value: prefValue === "true",
          };
        case UserPreferenceUnionType.NUMBER:
          return {
            ...pref,
            value: Number(prefValue),
          };
        default:
          return {
            ...pref,
            value: prefValue,
          };
      }
    });

    const userPreferences = Object.fromEntries(
      convertedPrefs.map((pref) => [pref.key, pref.value])
    );

    const mergedPreferences = {
      ...defaultUserPreferences,
      ...userPreferences,
    };

    return {
      success: true,
      data: {
        preferences: mergedPreferences,
      },
    };
  }

  @Patch("/@me/preferences")
  @Authorized()
  public async updatePreferences(
    @Account() user: User,
    @Body() preferences: Record<UserPreferences, string | boolean | number>
  ) {
    if (!preferences) {
      throw new BadRequestException("Invalid preferences");
    }

    const prefs = await prisma.userPreference.findMany({
      where: {
        userId: user.id,
      },
    });

    for (const [key, value] of Object.entries(preferences)) {
      const pref = prefs.find((p) => p.key === key);
      if (pref) {
        if (pref.valueType === UserPreferenceUnionType.BOOLEAN) {
          if (typeof value !== "boolean") {
            throw new BadRequestException(
              `Preference ${key} is a boolean, but you provided a ${typeof value}`
            );
          }
        } else if (pref.valueType === UserPreferenceUnionType.NUMBER) {
          if (typeof value !== "number") {
            throw new BadRequestException(
              `Preference ${key} is a number, but you provided a ${typeof value}`
            );
          }
        } else {
          if (typeof value !== "string") {
            throw new BadRequestException(
              `Preference ${key} is a string, but you provided a ${typeof value}`
            );
          }
        }

        const validator = userPreferenceValidators[key as UserPreferences];
        if (validator && !validator(value, user)) {
          throw new BadRequestException(
            `Preference ${key} has an invalid value`
          );
        }

        await prisma.userPreference.update({
          where: {
            id: pref.id,
          },
          data: {
            value: String(value),
          },
        });
      } else {
        if (userPreferences.includes(key as UserPreferences)) {
          let valueType: UserPreferenceUnionType;
          switch (typeof value) {
            case "boolean":
              valueType = UserPreferenceUnionType.BOOLEAN;
              break;
            case "number":
              valueType = UserPreferenceUnionType.NUMBER;
              break;
            default:
              valueType = UserPreferenceUnionType.STRING;
              break;
          }

          await prisma.userPreference.create({
            data: {
              key,
              value: String(value),
              valueType,
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          });

          if ((key as UserPreferences) === "@app/secret-gift" && value) {
            await prisma.user.update({
              where: {
                id: user.id,
              },
              data: {
                tickets: {
                  increment: 750,
                },
              },
            });
          }
        }
      }
    }

    return {
      success: true,
    };
  }

  @Get("/:uid/inventory-availability")
  public async getInventoryAvailability(@Param("uid") uid: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: Number(uid),
      },
    });

    if (!user)
      return <GetUserInventoryAvailabilityResponse>{
        success: false,
        message: "User not found",
      };

    return <GetUserInventoryAvailabilityResponse>{
      success: true,
      data: {
        available: !user.privacyPreferences.includes(
          PrivacyPreferences.HIDE_INVENTORY
        ),
      },
    };
  }
}

export default createHandler(UserRouter);
