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
import Authorized, { Account } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";
import rateLimitedResource, { RateLimitMiddleware } from "../../../util/rateLimit";

class NucleusRouter {
  @Post("/auth")
  public async authorize(@Header("authorization") authorization: string) {
    const match = await prisma.nucleusKey.findFirst({
      where: {
        key: authorization,
      },
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

    return {
      success: true,
      message: "Key deleted",
    };
  }

  @Post("/create")
  @UseMiddleware(RateLimitMiddleware(10))
  public async create(
    @Account() user: User,
    @Req() request: NextApiRequest,
    @Res() response: NextApiResponse,
    @Body() keyCreateBody: { name: string }
  ) {
    if (rateLimitedResource(request, response, 5) == 0) {
      return {
        success: false,
        message: "Too many requests",
      };
    }

    if (!keyCreateBody.name) {
      return {
        success: false,
        message: "No name provided",
      };
    }

    if (user.nucleusKeys.length >= 25) {
      return {
        success: false,
        message: "You have reached the maximum number of keys",
      };
    }

    const key = await prisma.nucleusKey.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        name: String(keyCreateBody.name) || "Nucleus key",
      },
    });

    return {
      success: true,
      message: "Key created",
      key,
    };
  }
}

export default createHandler(NucleusRouter);
