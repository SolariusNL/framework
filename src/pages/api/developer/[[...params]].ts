import { parse } from "@/components/render-markdown";
import Authorized, { Account } from "@/util/api/authorized";
import { exclude } from "@/util/exclude";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import { ApiKeyPermission, Prisma } from "@prisma/client";
import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  UnauthorizedException,
  createHandler,
} from "@solariusnl/next-api-decorators";
import sanitize from "sanitize-html";
import { ZodArray, ZodLiteral, z } from "zod";

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

  @Post("/@me/profile/update")
  @Authorized()
  public async updateProfile(@Account() user: User, @Body() body: unknown) {
    const validation = z.object({
      bioMd: z.string().max(2000),
      skills: z.array(
        z.object({
          name: z.string().max(30),
          description: z.string().max(120),
        })
      ),
      showcaseGames: z.array(z.number().int().positive().max(1000000000)),
      lookingForWork: z.boolean(),
    });

    const data = validation.parse(body);
    const p = await prisma.developerProfile.findUnique({
      where: {
        userId: user.id,
      },
      include: {
        showcaseGames: {
          select: {
            id: true,
          },
        },
      },
    });

    if (p) {
      await prisma.developerProfile.update({
        where: {
          userId: user.id,
        },
        data: {
          skills: {
            deleteMany: {},
          },
          showcaseGames: {
            disconnect: p?.showcaseGames.map((game) => ({
              id: game.id,
            })),
          },
        },
      });
    }

    const b: Prisma.DeveloperProfileUpdateInput = {
      bio: sanitize(parse(data.bioMd), {
        allowedTags: [
          "h2",
          "h3",
          "h4",
          "i",
          "b",
          "strong",
          "em",
          "a",
          "ul",
          "ol",
          "li",
          "p",
          "br",
          "pre",
          "code",
          "table",
          "thead",
          "tbody",
          "tr",
          "th",
          "td",
        ],
        allowedAttributes: {
          a: ["href", "target"],
        },
      }),
      bioMd: data.bioMd,
      skills: {
        createMany: {
          data: data.skills,
        },
      },
      showcaseGames: {
        connect: data.showcaseGames.map((game) => ({
          id: game,
        })),
      },
      lookingForWork: data.lookingForWork,
    };

    await prisma.developerProfile.upsert({
      where: {
        userId: user.id,
      },
      update: b,
      create: {
        ...(b as Prisma.DeveloperProfileCreateInput),
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return { success: true };
  }
}

export default createHandler(DeveloperRouter);
