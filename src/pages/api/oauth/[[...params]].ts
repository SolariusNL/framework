import { OAuthScope } from "@prisma/client";
import {
  Body,
  createHandler,
  Get,
  Header,
  Post,
  Query,
  Req,
  Res,
} from "@storyofams/next-api-decorators";
import type { NextApiRequest, NextApiResponse } from "next";
import { getClientIp } from "request-ip";
import { z } from "zod";
import Authorized, { Account } from "../../../util/api/authorized";
import { exclude } from "../../../util/exclude";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";
import { nonCurrentUserSelect } from "../../../util/prisma-types";
import { OperatingSystem } from "../../../util/ua";

async function getUserFromScopes(scopes: OAuthScope[], uid: number) {
  const user = await prisma.user.findFirst({
    where: {
      id: uid,
    },
    select: {
      ...exclude(nonCurrentUserSelect, "statusPosts"),
      ...(scopes.includes(OAuthScope.USER_EMAIL_READ)
        ? {
            email: true,
            emailVerified: true,
          }
        : {}),
    },
  });

  return user;
}

class OAuth2Router {
  @Get("/authorize")
  public async authorize(
    @Query("client_id") clientId: string,
    @Query("redirect_uri") redirectUri: string,
    @Query("auth") auth: string,
    @Res() res: NextApiResponse,
    @Req() req: NextApiRequest
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
        oauth: false,
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

    const newSession = await prisma.session.create({
      data: {
        user: {
          connect: {
            id: session.userId,
          },
        },
        oauth: true,
        os: OperatingSystem.Other,
        ip: getClientIp(req) || "",
        ua: req.headers["user-agent"] || "",
        token: Array(64)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join(""),
      },
    });

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
        code:
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15),
        session: newSession.token,
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

    const user = await getUserFromScopes(
      access.application.scopes,
      access.userId
    );

    return {
      success: true,
      access_token: access.session,
      token_type: "bearer",
      expires_in: access.expiresAt,
      scope: access.application.scopes.join(","),
      user: user,
    };
  }

  @Get("/me")
  public async me(@Header("Authorization") auth: string) {
    const access = await prisma.oAuthClient.findFirst({
      where: {
        session: auth
          .split(" ")
          .filter((x) => x !== "Bearer")
          .join(" "),
      },
      include: {
        application: true,
      },
    });

    if (!access) {
      return {
        success: false,
        error: "Invalid access token",
      };
    }

    const user = await getUserFromScopes(
      access.application.scopes,
      access.userId
    );

    if (!user) {
      return {
        success: false,
        error: "Unknown error",
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
      user: user,
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
