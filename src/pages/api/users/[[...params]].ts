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

interface UserUpdateBody {
  username?: string;
}

class UserRouter {
  @Get("/@me")
  @Authorized()
  public async getMe(@Account() user: User) {
    return user;
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
