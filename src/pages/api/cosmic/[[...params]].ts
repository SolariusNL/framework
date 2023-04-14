import { createHandler, Get, Param } from "@storyofams/next-api-decorators";
import Authorized, { Account } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";

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

  @Get("/my/servers/:id/stdout")
  @Authorized()
  public async getMyServerStdout(
    @Account() user: User,
    @Param("id") id: string
  ) {
    const logs = await prisma.nucleusStdout.findMany({
      where: {
        connectionId: id,
        connection: {
          game: {
            authorId: user.id,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 150,
    });

    return logs.map((log) => log.line);
  }
}

export default createHandler(CosmicRouter);
