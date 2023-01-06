import { ApiKeyPermission } from "@prisma/client";
import {
  Body,
  createHandler,
  Delete,
  Get,
  Param,
  Post,
  UnauthorizedException,
} from "@storyofams/next-api-decorators";
import { z, ZodArray, ZodLiteral } from "zod";
import Authorized, { Account } from "../../../util/api/authorized";
import { exclude } from "../../../util/exclude";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";

class DeveloperRouter {
  @Get("/@me/apikeys")
  @Authorized()
  public async getApiKeys(@Account() user: User) {
    const keys = await prisma.apiKey.findMany({
      where: {
        userId: user.id,
      },
    });

    return keys.map((key) => exclude(key, "key"));
  }

  @Post("/@me/apikeys")
  @Authorized()
  public async createApiKey(@Account() user: User, @Body() body: unknown) {
    const validation = z.object({
      name: z.string(),
      permissions: z.array(
        z.union(Object.values(ApiKeyPermission).map((p) => z.literal(p)) as any)
      ) as unknown as ZodArray<ZodLiteral<ApiKeyPermission>>,
    });

    const { name, permissions } = validation.parse(body);

    const count = await prisma.apiKey.count({
      where: {
        userId: user.id,
      },
    });

    if (count >= 100) {
      throw new UnauthorizedException("You can only have 100 API keys");
    }

    const key = await prisma.apiKey.create({
      data: {
        name,
        permissions,
        key: Array.from({ length: 64 })
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join(""),
        userId: user.id,
      },
    });

    return key;
  }

  @Delete("/@me/apikeys/:id")
  @Authorized()
  public async deleteApiKey(@Account() user: User, @Param("id") id: string) {
    const key = await prisma.apiKey.findUnique({
      where: {
        id,
      },
    });

    if (!key) {
      throw new UnauthorizedException("API key not found");
    }

    if (key.userId !== user.id) {
      throw new UnauthorizedException("You can only delete your own API keys");
    }

    await prisma.apiKey.delete({
      where: {
        id,
      },
    });

    return { success: true };
  }
}

export default createHandler(DeveloperRouter);
