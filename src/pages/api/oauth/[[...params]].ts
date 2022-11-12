import {
  Body,
  createHandler,
  Get,
  Param,
  Post,
  Query,
  Res,
} from "@storyofams/next-api-decorators";
import type { NextApiResponse } from "next";
import Authorized, { Account } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import { nonCurrentUserSelect } from "../../../util/prisma-types";
import type { User } from "../../../util/prisma-types";

class OAuth2Router {
  @Get("/authorize")
  public async authorize(
    @Query("client_id") clientId: string,
    @Query("redirect_uri") redirectUri: string,
    @Query("auth") auth: string,
    @Res() res: NextApiResponse
  ) {
    const app = await prisma.oAuth2Client.findFirst({
      where: {
        secret: clientId,
      },
    });

    if (!app) {
      return {
        success: false,
        error: "Invalid client id",
      };
    }

    if (!app.redirectUri.includes(redirectUri)) {
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

    const access = await prisma.oAuth2Access.create({
      data: {
        user: {
          connect: {
            id: session.userId,
          },
        },
        client: {
          connect: {
            id: app.id,
          },
        },
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6),
      },
    });

    res.redirect(`${redirectUri}?access=${access.id}`);
  }

  @Get("/access/:id")
  public async access(@Param("id") id: string) {
    const access = await prisma.oAuth2Access.findFirst({
      where: {
        id,
      },
    });

    if (!access) {
      return {
        success: false,
        error: "Invalid access token",
      };
    }

    const user = await prisma.user.findFirst({
      where: {
        id: access.userId,
      },
      select: {
        ...nonCurrentUserSelect.select,
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
      include: {
        user: true,
      },
    });

    if (!found) {
      return {
        error: "Invalid code",
      };
    }

    if (found.user !== null && found.user.id !== account.id) {
      return {
        error: "Code already used",
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
