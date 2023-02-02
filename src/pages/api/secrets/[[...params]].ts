import {
  Body,
  createHandler,
  Param,
  Post,
} from "@storyofams/next-api-decorators";
import Authorized, { Account } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";

interface CreateSecretBody {
  name: string;
  value: string;
}

class SecretsRouter {
  @Authorized()
  @Post("/create")
  public async createSecret(
    @Account() user: User,
    @Body() body: CreateSecretBody
  ) {
    const { name, value } = body;
    if (name.length > 32 || value.length > 1024) {
      return {
        error: "Secret name or value is too long",
      };
    }

    const existingName = await prisma.secret.findFirst({
      where: {
        name,
        userId: user.id,
      },
    });

    if (existingName) {
      return {
        error: "Secret name already exists",
      };
    }

    const secret = await prisma.secret.create({
      data: {
        name,
        code: value,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return {
      secret,
    };
  }

  @Authorized()
  @Post("/:id/delete")
  public async deleteSecret(@Account() user: User, @Param("id") id: string) {
    const secret = await prisma.secret.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!secret) {
      return {
        error: "Secret not found",
      };
    }

    if (secret.userId !== user.id) {
      return {
        error: "You do not own this secret",
      };
    }

    await prisma.secret.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  }
}

export default createHandler(SecretsRouter);
