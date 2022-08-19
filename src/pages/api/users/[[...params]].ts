import {
  Body,
  createHandler,
  Get,
  Post,
  UseMiddleware,
} from "@storyofams/next-api-decorators";
import Authorized, { Account } from "../../../util/api/authorized";
import countries from "../../../util/countries";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";
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

  @Post("/@me/change-email")
  @Authorized()
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

  @Post("/@me/update")
  @Authorized()
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
