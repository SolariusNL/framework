import { Body, createHandler, Post } from "@storyofams/next-api-decorators";
import Authorized, { Account } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";
import { RateLimitMiddleware } from "../../../util/rateLimit";

class DatastoreRouter {
  @Post("/new")
  @Authorized()
  @RateLimitMiddleware(3)()
  public async createDatastore(
    @Account() user: User,
    @Body() body: { name: string; desc: string; game: number }
  ) {
    const { name, desc, game } = body;
    if (!name || !desc || !game) {
      return {
        status: 400,
        success: false,
        body: {
          message: "Missing required fields",
        },
      };
    }

    if (name.length > 64 || desc.length > 256) {
      return {
        status: 400,
        success: false,
        body: {
          message: "Name or description too long",
        },
      };
    }

    const gameExists = await prisma.game.findFirst({
      where: {
        id: game,
        authorId: user.id,
      },
    });

    if (!gameExists) {
      return {
        status: 400,
        success: false,
        body: {
          message: "Invalid game",
        },
      };
    }

    const datastore = await prisma.gameDatastore.create({
      data: {
        name,
        desc,
        game: {
          connect: {
            id: game,
          },
        },
        data: {
          create: {
            key: "hello",
            value: "world",
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        storeId: Math.random().toString(36).substring(2, 15),
      },
    });

    return {
      status: 200,
      success: true,
      datastore,
    };
  }
}

export default createHandler(DatastoreRouter);
