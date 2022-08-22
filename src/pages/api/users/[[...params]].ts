import {
  Body,
  createHandler,
  Get,
  Param,
  Post,
} from "@storyofams/next-api-decorators";
import { category } from "../../../components/ReportUser";
import Authorized, { Account } from "../../../util/api/authorized";
import countries from "../../../util/countries";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";
import { RateLimitMiddleware } from "../../../util/rateLimit";
import { verificationEmail } from "../../../util/templates/verification-email";

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

    if (!oldPassword || !newPassword) {
      return {
        status: 400,
        message: "Missing oldPassword or newPassword",
      };
    }

    if (oldPassword === newPassword) {
      return {
        status: 400,
        message: "New password is the same as the current password",
      };
    }

    if (oldPassword != user.password) {
      return {
        status: 400,
        message: "Old password is not correct",
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPassword },
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

    return {
      success: true,
      message: "User reported successfully",
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
  public async donate(@Account() user: User, @Param("id") id: number, @Param("amount") amount: number) {
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
        }
      },
    });

    await prisma.user.update({
      where: {
        id: donatingUser.id,
      },
      data: {
        tickets: {
          increment: Number(amount),
        }
      },
    });

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
        regex: /^[a-zA-Z0-9_]{3,24}$/,
        error:
          "Username must be between 3 and 24 characters long and can only contain letters, numbers, and underscores",
      },
      {
        name: "country",
        verify: (value: string) => countries.find((c) => c.code === value),
        error: "Invalid country",
      },
      {
        name: "bio",
        regex: /^.{0,255}$/,
        error: "Bio must be less than 255 characters",
      },
      {
        name: "busy",
        regex: /^(true|false)$/,
        error: "Busy must be true or false",
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
            !field.verify(data[field.name as keyof UserUpdateBody] as string)
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
}

export default createHandler(UserRouter);
