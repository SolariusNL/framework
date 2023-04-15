import {
  Body,
  createHandler,
  Get,
  Param,
  Post,
  Query,
} from "@storyofams/next-api-decorators";
import fetch from "node-fetch";
import Authorized, {
  Account,
  AdminAuthorized,
  Nucleus,
  NucleusAuthorized,
} from "../../../util/api/authorized";
import logger from "../../../util/logger";
import prisma from "../../../util/prisma";
import type { NucleusKey, User } from "../../../util/prisma-types";
import { nonCurrentUserSelect } from "../../../util/prisma-types";
import { RateLimitMiddleware } from "../../../util/rate-limit";

class NucleusRouter {
  @Post("/:key/delete")
  public async delete(@Param("key") key: string, @Account() user: User) {
    if (!key) {
      return {
        success: false,
        message: "No key provided",
      };
    }

    const match = await prisma.nucleusKey.findFirst({
      where: {
        key: String(key),
      },
    });

    if (!match) {
      return {
        success: false,
        message: "Invalid key",
      };
    }

    if (match.userId !== user.id) {
      return {
        success: false,
        message: "You do not have permission to delete this key",
      };
    }

    await prisma.nucleusKey.delete({
      where: {
        id: match.id,
      },
    });

    await prisma.connection.delete({
      where: {
        id: match.connectionId,
      },
    });

    return {
      success: true,
      message: "Key deleted",
    };
  }

  @Post("/createauthticket")
  @Authorized()
  @RateLimitMiddleware(20)()
  public async createAuthTicket(@Account() user: User) {
    await prisma.nucleusAuthTicket.deleteMany({
      where: {
        userId: user.id,
      },
    });

    const ticket = await prisma.nucleusAuthTicket.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return ticket;
  }

  @Post("/:ticket/fulfill")
  @NucleusAuthorized()
  public async fulfillAuthTicket(
    @Param("ticket") ticket: string,
    @Nucleus() nucleus: NucleusKey
  ) {
    const match = await prisma.nucleusAuthTicket.findFirst({
      where: {
        ticket: String(ticket),
      },
    });

    if (!match) {
      return {
        success: false,
        message: "Invalid ticket",
      };
    }

    if (match.fulfilled) {
      return {
        success: false,
        message: "Ticket already fulfilled",
      };
    }

    const res = await prisma.nucleusAuthTicket.update({
      where: {
        id: match.id,
      },
      data: {
        fulfilled: true,
      },
      select: {
        user: nonCurrentUserSelect,
      },
    });

    await prisma.game.update({
      where: {
        id: nucleus.connection.game.id,
      },
      data: {
        playing: {
          increment: 1,
        },
        visits: {
          increment: 1,
        },
        playingUsers: {
          connect: {
            id: res.user.id,
          },
        },
      },
    });

    return {
      success: true,
      message: "Ticket fulfilled",
      user: res.user,
    };
  }

  @Post("/:ticket/invalidate")
  @NucleusAuthorized()
  public async invalidateTicket(
    @Param("ticket") ticket: string,
    @Nucleus() nucleus: NucleusKey
  ) {
    const match = await prisma.nucleusAuthTicket.findFirst({
      where: {
        ticket: String(ticket),
      },
    });

    if (!match) {
      return {
        success: false,
        message: "Invalid ticket",
      };
    }

    await prisma.nucleusAuthTicket.delete({
      where: {
        id: match.id,
      },
    });

    await prisma.game.update({
      where: {
        id: nucleus.connection.game.id,
      },
      data: {
        playing: {
          decrement: 1,
        },
        playingUsers: {
          disconnect: {
            id: match.userId,
          },
        },
      },
    });

    return {
      success: true,
      message: "Ticket invalidated",
    };
  }

  @Authorized()
  @Get("/my/connections")
  public async getConnections(@Account() user: User) {
    const keys = await prisma.connection.findMany({
      where: {
        game: {
          authorId: user.id,
        },
      },
    });

    return keys;
  }

  @Authorized()
  @Post("/connections/:id/delete")
  public async deleteConnection(
    @Param("id") id: string,
    @Account() user: User
  ) {
    const connection = await prisma.connection.findFirst({
      where: {
        id: String(id),
        game: {
          authorId: user.role === "ADMIN" ? undefined : user.id,
        },
      },
    });

    if (!connection) {
      return {
        success: false,
        message: "Invalid connection",
      };
    }

    await prisma.nucleusKey.deleteMany({
      where: {
        connectionId: connection.id,
      },
    });

    await prisma.connection.delete({
      where: {
        id: String(id),
      },
    });

    return {
      success: true,
      message: "Connection deleted",
    };
  }

  @NucleusAuthorized()
  @Post("/webhook/verify/:sig")
  public async verifyWebhook(@Param("sig") sig: string) {
    const match = await prisma.cosmicWebhookSignature.findFirst({
      where: {
        secret: String(sig),
      },
    });

    if (!match || match.createdAt < new Date(Date.now() - 1000 * 60 * 5)) {
      return {
        success: false,
        message: "Invalid signature",
      };
    }

    await prisma.cosmicWebhookSignature.delete({
      where: {
        id: match.id,
      },
    });

    return {
      success: true,
      message: "Signature verified",
    };
  }

  @Post("/shutdown/:gameid")
  @Authorized()
  public async shutdown(
    @Param("gameid") gameid: number,
    @Account() user: User
  ) {
    const game = await prisma.game.findFirst({
      where: {
        id: Number(gameid),
        authorId: user.role === "ADMIN" ? undefined : user.id,
      },
    });

    if (!game) {
      return {
        success: false,
        message: "Invalid game or you do not have permission to shut it down",
      };
    }

    const connections = await prisma.connection.findMany({
      where: {
        gameId: game.id,
        online: true,
      },
    });

    connections.forEach(async (conn) => {
      const webhookAuth = await prisma.cosmicWebhookSignature.create({
        data: {},
      });

      fetch(`http://${conn.ip}:${conn.port}/api/webhook/shutdown`, {
        headers: {
          "nucleus-signature": webhookAuth.secret,
        },
        method: "POST",
      }).catch((e) => {
        logger().warn(
          `Failed to shut down connection ${conn.id} for game ${game.id}`
        );
      });
    });

    return {
      success: true,
      message: "Game shut down",
    };
  }

  @Get("/test/:gameid")
  @Authorized()
  public async test(@Param("gameid") gameid: number, @Account() user: User) {
    const game = await prisma.game.findFirst({
      where: {
        id: Number(gameid),
        authorId: user.role === "ADMIN" ? undefined : user.id,
      },
    });

    if (!game) {
      return {
        success: false,
        message:
          "Invalid game or you do not have permission to test its connections",
      };
    }

    const connections = await prisma.connection.findMany({
      where: {
        gameId: game.id,
      },
    });

    const conn = connections[0];

    async function error() {
      logger().warn(
        `Failed to test connection ${conn.id} for game ${conn.gameId}, will be marked as offline`
      );
      await prisma.connection.update({
        where: {
          id: conn.id,
        },
        data: {
          online: false,
        },
      });

      return {
        success: false,
        message: "Connection offline",
      };
    }

    try {
      const res = await fetch(`http://${conn.ip}:${conn.port}/api/server`);

      if (!res.ok) {
        return error();
      }

      const json = await res.json();

      return {
        success: true,
        data: json,
      };
    } catch (e) {
      return error();
    }
  }

  @Get("/servers")
  @AdminAuthorized()
  public async getServers(
    @Query("page") page: number,
    @Query("status") status: "online" | "offline" | "all"
  ) {
    const where = {
      online: status === "all" ? undefined : status === "online",
    };

    const count = await prisma.connection.count({ where });
    const connections = await prisma.connection.findMany({
      where,
      take: 20,
      skip: (page - 1) * 20,
    });

    return {
      pages: Math.ceil(count / 20),
      servers: connections,
    };
  }

  @Post("/servers/:id/command/run")
  @Authorized()
  public async runRemoteCommand(
    @Param("id") id: string,
    @Body() body: { command: string; args?: string },
    @Account() user: User
  ) {
    const connection = await prisma.connection.findFirst({
      where: {
        id: String(id),
        game: {
          authorId: user.role === "ADMIN" ? undefined : user.id,
        },
      },
    });

    if (!connection) {
      return {
        success: false,
        message: "Invalid connection",
      };
    }

    const webhookAuth = await prisma.cosmicWebhookSignature.create({
      data: {},
    });

    fetch(
      `http://${connection.ip}:${connection.port}/api/webhook/command/run`,
      {
        headers: {
          "nucleus-signature": webhookAuth.secret,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(body),
      }
    ).catch((e) => {
      logger().warn(
        `Failed to run command on connection ${connection.id} for game ${connection.gameId}`
      );
    });

    return {
      success: true,
      message: "Command run",
    };
  }
}

export default createHandler(NucleusRouter);
