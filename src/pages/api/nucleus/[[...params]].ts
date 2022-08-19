import {
  Body,
  createHandler,
  Header,
  Param,
  Post,
  Req,
  Res,
  UseMiddleware,
} from "@storyofams/next-api-decorators";
import type { NextApiRequest, NextApiResponse } from "next";
import Authorized, {
  Account,
  NucleusAuthorized,
} from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import { nonCurrentUserSelect } from "../../../util/prisma-types";
import type { User } from "../../../util/prisma-types";
import rateLimitedResource from "../../../util/rateLimit";

class NucleusRouter {
  @Post("/auth")
  public async authorize(
    @Header("authorization") authorization: string,
    @Req() request: NextApiRequest,
    @Res() response: NextApiResponse
  ) {
    const match = await prisma.nucleusKey.findFirst({
      where: {
        key: authorization,
      },
      include: {
        connection: {
          include: {
            game: true,
          }
        },
      }
    });

    if (!match) {
      return {
        success: false,
        message: "Invalid authorization key",
      };
    } else {
      return {
        success: true,
        message: "Authorized with Nucleus",
        game: {
          id: match.connection.gameId,
          name: match.connection.game.name,
        },
      };
    }
  }

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

    await prisma.connection.delete({
      where: {
        id: match.connectionId,
      },
    });

    await prisma.nucleusKey.delete({
      where: {
        id: match.id,
      },
    });

    return {
      success: true,
      message: "Key deleted",
    };
  }

  @Post("/create-auth-ticket")
  @Authorized()
  public async createAuthTicket(@Account() user: User) {
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
  public async fulfillAuthTicket(@Param("ticket") ticket: string) {
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

    const res = await prisma.nucleusAuthTicket.update({
      where: {
        id: match.id,
      },
      data: {
        fulfilled: true,
      },
      select: {
        user: nonCurrentUserSelect,
      }
    });

    return {
      success: true,
      message: "Ticket fulfilled",
      user: res.user,
    };
  }

  @Post("/:ticket/invalidate")
  @NucleusAuthorized()
  public async invalidateTicket(@Param("ticket") ticket: string) {
    const match = await prisma.nucleusAuthTicket.findFirst({
      where: {
        id: String(ticket),
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

    return {
      success: true,
      message: "Ticket invalidated",
    };
  }
}

export default createHandler(NucleusRouter);
