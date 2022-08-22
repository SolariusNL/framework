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
  Nucleus,
  NucleusAuthorized,
} from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import { nonCurrentUserSelect } from "../../../util/prisma-types";
import type { User } from "../../../util/prisma-types";
import type { NucleusKey } from "../../../util/prisma-types";
import rateLimitedResource, {
  RateLimitMiddleware,
} from "../../../util/rateLimit";

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
          },
        },
      },
    });

    if (!match) {
      return {
        success: false,
        message: "Invalid authorization key",
      };
    } else {
      await prisma.connection.update({
        where: {
          id: match.connectionId,
        },
        data: {
          online: true,
        },
      });

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
      },
    });

    return {
      success: true,
      message: "Ticket invalidated",
    };
  }
}

export default createHandler(NucleusRouter);
