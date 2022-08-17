import {
  Body,
  createHandler,
  Get,
  Post,
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

class UserRouter {
  @Get("/@me")
  @Authorized()
  public async getMe(@Account() user: User) {
    return user;
  }

  @Get("/@me/verify-email")
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
        verify:
          (value: string) => countries.find(c => c.code === value),
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
      }
    ];

    for (const field of updatable) {
      if (data[field.name as keyof UserUpdateBody]) {
        if (field.regex) {
          if (
            !field.regex.test(data[field.name as keyof UserUpdateBody] as string)
          ) {
            return {
              error: field.error,
              status: 400,
            };
          }
        } else {
          if (!field.verify(data[field.name as keyof UserUpdateBody] as string)) {
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
