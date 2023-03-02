import { createHandler, Get } from "@storyofams/next-api-decorators";
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
          }
        }
      }
    });

    return servers || [];
  }
}

export default createHandler(CosmicRouter);
