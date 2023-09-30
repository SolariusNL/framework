import Authorized, { Account } from "@/util/api/authorized";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import {
  createHandler,
  Get,
  Param,
  Query,
} from "@solariusnl/next-api-decorators";

class CosmicRouter {
  @Get("/my/servers")
  @Authorized()
  public async getMyServers(@Account() user: User) {
    const servers = await prisma.connection.findMany({
      where: {
        game: {
          authorId: user.id,
        },
      },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            iconUri: true,
          },
        },
        nucleusKey: true,
        commands: true,
      },
    });

    return servers.map((server) => ({
      ...server,
      nucleusKey: server.nucleusKey[0],
    }));
  }

  @Get("/my/servers/:id/stdout/:page")
  @Authorized()
  public async getMyServerStdout(
    @Account() user: User,
    @Param("id") id: string,
    @Param("page") page: number = 1,
    @Query("category") category?: string
  ) {
    const logs = await prisma.nucleusStdout.findMany({
      where: {
        connectionId: id,
        connection: {
          game: {
            authorId: user.id,
          },
        },
        ...(category &&
          category !== "all" && {
            category: String(category),
          }),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
      skip: (page - 1) * 20,
    });

    return logs.map((log) => log.line);
  }
}

export default createHandler(CosmicRouter);
