import IResponseBase from "@/types/api/IResponseBase";
import Authorized, {
  Account,
  Nucleus,
  NucleusAuthorized,
} from "@/util/api/authorized";
import prisma from "@/util/prisma";
import type { NucleusKey, User } from "@/util/prisma-types";
import { RateLimitMiddleware } from "@/util/rate-limit";
import {
  Body,
  Delete,
  Get,
  Param,
  Post,
  createHandler,
} from "@solariusnl/next-api-decorators";

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
            value: { coins: 500 },
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

  @Get("/:id/query/:key")
  @NucleusAuthorized()
  @RateLimitMiddleware(150)()
  public async queryDatastore(
    @Param("id") id: string,
    @Param("key") key: string,
    @Nucleus() nucleus: NucleusKey
  ) {
    const datastore = await prisma.gameDatastore.findFirst({
      where: {
        id: id,
      },
      include: {
        game: true,
        data: {
          where: {
            key: {
              equals: key,
            },
          },
        },
      },
    });

    if (!datastore) {
      return {
        status: 404,
        success: false,
        body: {
          message: "Datastore not found",
        },
      };
    }

    if (nucleus.connection.game.id !== datastore.game.id) {
      return {
        status: 403,
        success: false,
        body: {
          message: "You do not have permission to access this datastore",
        },
      };
    }

    return {
      status: 200,
      success: true,
      data: datastore.data[0],
    };
  }

  @Post("/:id/set/:key")
  @NucleusAuthorized()
  @RateLimitMiddleware(150)()
  public async setDatastore(
    @Param("id") id: string,
    @Param("key") key: string,
    @Body() body: { value: object },
    @Nucleus() nucleus: NucleusKey
  ) {
    const datastore = await prisma.gameDatastore.findFirst({
      where: {
        id: id,
      },
      include: {
        game: true,
      },
    });

    if (!datastore) {
      return {
        status: 404,
        success: false,
        body: {
          message: "Datastore not found",
        },
      };
    }

    if (nucleus.connection.game.id !== datastore.game.id) {
      return {
        status: 403,
        success: false,
        body: {
          message: "You do not have permission to access this datastore",
        },
      };
    }

    const data = await prisma.gameDatastoreKeyValuePair.findFirst({
      where: {
        key: key,
        gameDatastoreId: datastore.id,
      },
    });

    if (data) {
      await prisma.gameDatastoreKeyValuePair.update({
        where: {
          id: data.id,
        },
        data: {
          value: body.value,
        },
      });
    } else {
      await prisma.gameDatastoreKeyValuePair.create({
        data: {
          key: key,
          value: body.value,
          gameDatastore: {
            connect: {
              id: datastore.id,
            },
          },
        },
      });
    }

    return {
      success: true,
    };
  }

  @Delete("/:id/delete")
  @Authorized()
  @RateLimitMiddleware(5)()
  async deleteDatastore(@Param("id") id: string, @Account() user: User) {
    const datastore = await prisma.gameDatastore.findFirst({
      where: {
        id: id,
      },
      include: {
        game: true,
      },
    });

    if (!datastore) {
      return <IResponseBase>{
        success: false,
        message: "Datastore not found",
      };
    }

    if (datastore.game.authorId !== user.id) {
      return <IResponseBase>{
        success: false,
        message: "You do not have permission to delete this datastore",
      };
    }

    await prisma.gameDatastoreKeyValuePair.deleteMany({
      where: {
        gameDatastoreId: datastore.id,
      },
    });

    await prisma.gameDatastore.delete({
      where: {
        id: datastore.id,
      },
    });

    return <IResponseBase>{
      success: true,
    };
  }
}

export default createHandler(DatastoreRouter);
