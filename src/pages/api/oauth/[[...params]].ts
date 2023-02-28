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
import { z } from "zod";
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
        session: session.token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6),
      },
    });

    res.redirect(
      `${redirectUri}?code=${
        access.code
      }&token_type=bearer&expires_in=${access.expiresAt.getTime()}&scope=${app.scopes.join(
        ","
      )}`
    );
  }

  @Post("/token")
  public async token(@Body() body: unknown) {
    const schema = z.object({
      client_id: z.string(),
      client_secret: z.string(),
      code: z.string(),
    });

    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid body",
      };
    }

    const access = await prisma.oAuthClient.findFirst({
      where: {
        code: parsed.data.code,
      },
      include: { application: true },
    });

    if (!access) {
      return {
        success: false,
        error: "Invalid code",
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

    if (
      access.applicationId !== parsed.data.client_id ||
      access.application.secret !== parsed.data.client_secret
    ) {
      return {
        success: false,
        error: "Invalid client id or secret",
      };
    }

    return {
      success: true,
      access_token: access.session,
      token_type: "bearer",
      expires_in: access.expiresAt,
      scope: access.application.scopes.join(","),
    };
  }

  @Get("/me")
  public async me(@Header("Authorization") auth: string) {
    const access = await prisma.oAuthClient.findFirst({
      where: {
        session: auth,
      },
      include: {
        user: {
          ...exclude(nonCurrentUserSelect, "statusPosts"),
          email: true,
        },
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

    return {
      success: true,
      user: access.user,
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
