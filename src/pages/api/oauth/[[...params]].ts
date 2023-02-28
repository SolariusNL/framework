import {
  Body,
  createHandler,
  Get,
  Header,
  Post,
  Query,
  Res,
} from "@storyofams/next-api-decorators";
import type { NextApiResponse } from "next";
import Authorized, { Account } from "../../../util/api/authorized";
import { exclude } from "../../../util/exclude";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";
import { nonCurrentUserSelect } from "../../../util/prisma-types";

class OAuth2Router {
  @Get("/authorize")
  public async authorize(
    @Query("client_id") clientId: string,
    @Query("redirect_uri") redirectUri: string,
    @Query("auth") auth: string,
    @Res() res: NextApiResponse
  ) {
    const app = await prisma.oAuthApplication.findFirst({
      where: {
        id: clientId,
      },
    });

    if (!app) {
      return {
        success: false,
        error: "Invalid client id",
      };
    }

    if (app.redirectUri !== redirectUri) {
      return {
        success: false,
        error: "Invalid redirect uri",
      };
    }

    const session = await prisma.session.findFirst({
      where: {
        token: auth,
      },
      include: {
        user: nonCurrentUserSelect,
      },
    });

    if (!session) {
      return {
        success: false,
        error: "Invalid auth token",
      };
    }

    const access = await prisma.oAuthClient.create({
      data: {
        user: {
          connect: {
            id: session.userId,
          },
        },
        application: {
          connect: {
            id: app.id,
          },
        },
        code: await crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6),
      },
    });

    res.redirect(
      `${redirectUri}?access_token=${
        access.code
      }&token_type=bearer&expires_in=${access.expiresAt.getTime()}&scope=${app.scopes.join(
        ","
      )}`
    );
  }

  @Get("/access")
  public async access(@Header("Authorization") auth: string) {
    const access = await prisma.oAuthClient.findFirst({
      where: {
        code: auth,
      },
    });

    if (!access) {
      return {
        success: false,
        error: "Invalid access token",
      };
    }

    if (new Date(access.expiresAt as Date).getTime() < new Date().getTime()) {
      await prisma.oAuthClient.delete({
        where: {
          id: access.id,
        },
      });

      return {
        success: false,
        error: "Access token expired",
      };
    }

    const user = await prisma.user.findFirst({
      where: {
        id: access.userId,
      },
      select: {
        ...exclude(nonCurrentUserSelect.select, "statusPosts"),
      },
    });

    return {
      success: true,
      user,
    };
  }

  @Post("/services/discord/connect")
  @Authorized()
  public async connectDiscord(
    @Body() body: { code: string },
    @Account() account: User
  ) {
    const found = await prisma.discordConnectCode.findFirst({
      where: {
        code: body.code,
      },
    });

    if (!found) {
      return {
        error: "Invalid code",
      };
    }

    if (
      found.userId != null ||
      found.createdAt.getTime() + 1000 * 60 * 5 < Date.now()
    ) {
      return {
        error: "Invalid code",
      };
    }

    await prisma.discordConnectCode.update({
      where: {
        id: found.id,
      },
      data: {
        user: {
          connect: {
            id: account.id,
          },
        },
      },
    });

    return {
      imageUrl: found.imageUrl,
      username: found.username,
      discriminator: found.discriminator,
    };
  }
}

export default createHandler(OAuth2Router);
