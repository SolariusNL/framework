import { GetMyOAuth2ApplicationsSelect } from "@/types/api/IGetMyOAuth2ApplicationsResponse";
import Authorized, { Account } from "@/util/api/authorized";
import { exclude } from "@/util/exclude";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import { nonCurrentUserSelect } from "@/util/prisma-types";
import SuccessResponse from "@/util/response/success";
import { OperatingSystem } from "@/util/ua";
import { OAuthScope } from "@prisma/client";
import {
  BadRequestException,
  Body,
  createHandler,
  Delete,
  Get,
  Header,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from "@solariusnl/next-api-decorators";
import { randomUUID } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { getClientIp } from "request-ip";
import { z } from "zod";

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
        oauth: null,
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
        oauth: {
          connect: {
            id: app.id,
          },
        },
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

    return {
      success: true,
      access_token: access.session,
      token_type: "bearer",
      expires_in: access.expiresAt,
      scope: access.application.scopes.join(","),
      userId: access.userId,
    };
  }

  @Get("/me")
  public async me(@Header("Authorization") auth: string) {
    const bearer = auth.split(" ");
    const access = await prisma.oAuthClient.findFirst({
      where: {
        session: bearer[1],
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

    const user = await prisma.user.findFirst({
      where: {
        id: access.userId,
      },
      select: {
        ...exclude(nonCurrentUserSelect.select, "statusPosts"),
        ...(access.application.scopes.includes(OAuthScope.USER_EMAIL_READ)
          ? {
              email: true,
              emailVerified: true,
            }
          : {}),
      },
    });

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

  @Get("/my/apps")
  @Authorized()
  public async getMyOAuthApplications(@Account() user: User) {
    const apps = await prisma.oAuthApplication.findMany({
      where: {
        ownerId: user.id,
      },
      select: GetMyOAuth2ApplicationsSelect,
    });

    return new SuccessResponse("Successfully retrieved applications", {
      apps,
    });
  }

  @Post("/my/apps/new")
  @Authorized()
  public async createOAuthApplication(
    @Account() user: User,
    @Body() body: unknown
  ) {
    const schema = z.object({
      name: z.string(),
      description: z.string(),
      redirectUri: z.string(),
      scopes: z.array(z.nativeEnum(OAuthScope)),
    });

    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestException("Invalid body");
    }

    const app = await prisma.oAuthApplication.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        redirectUri: parsed.data.redirectUri,
        scopes: parsed.data.scopes,
        owner: {
          connect: {
            id: user.id,
          },
        },
        secret: randomUUID(),
      },
      select: {
        ...GetMyOAuth2ApplicationsSelect,
        secret: true,
      },
    });

    return new SuccessResponse("Successfully created application", {
      app,
    });
  }

  @Delete("/my/apps/:id")
  @Authorized()
  public async deleteOAuthApplication(
    @Account() user: User,
    @Param("id") id: string
  ) {
    const app = await prisma.oAuthApplication.findFirst({
      where: {
        id,
        ownerId: user.id,
      },
    });

    if (!app) {
      throw new NotFoundException("Application not found");
    }

    await prisma.oAuthClient.deleteMany({
      where: {
        applicationId: id,
      },
    });
    await prisma.oAuthApplication.delete({
      where: {
        id,
      },
    });

    return new SuccessResponse("Successfully deleted application", {});
  }

  @Patch("/my/apps/:id")
  @Authorized()
  public async refreshSecret(@Account() user: User, @Param("id") id: string) {
    const app = await prisma.oAuthApplication.findFirst({
      where: {
        id,
        ownerId: user.id,
      },
    });

    if (!app) {
      throw new NotFoundException("Application not found");
    }

    const secret = randomUUID();

    await prisma.oAuthApplication.update({
      where: {
        id,
      },
      data: {
        secret,
      },
    });

    return new SuccessResponse("Successfully refreshed secret", {
      secret,
    });
  }
}

export default createHandler(OAuth2Router);
