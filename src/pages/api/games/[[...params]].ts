import { GameGenre } from "@prisma/client";
import {
  Body,
  createHandler,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseMiddleware,
} from "@storyofams/next-api-decorators";
import type { NextApiRequest, NextApiResponse } from "next";
import sanitizeHtml from "sanitize-html";
import Authorized, { Account } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import {
  gameSelect,
  nonCurrentUserSelect,
  type User,
} from "../../../util/prisma-types";

interface GameCreateBody {
  gameName: string;
  description: string;
  genre: GameGenre;
  maxPlayers: number;
  communityGuidelines: boolean;
}

interface CreateConnectionBody {
  ip: string;
  port: number;
}

interface GameCommentBody {
  body: string;
}

class GameRouter {
  @Post("/create")
  @Authorized()
  public async createGame(@Body() body: GameCreateBody, @Account() account: User) {
    const { gameName, description, genre, maxPlayers, communityGuidelines } =
      body;

    if (
      !gameName ||
      !description ||
      !genre ||
      !maxPlayers ||
      !communityGuidelines ||
      !Object.values(GameGenre).includes(genre)
    ) {
      return {
        error: "Invalid game data",
      };
    }

    const game = await prisma.game.create({
      data: {
        name: gameName,
        description: sanitizeHtml(description, {
          allowedTags: [
            "b",
            "i",
            "strong",
            "u",
            "a",
            "code",
            "h1",
            "h2",
            "h3",
            "h4",
            "blockquote",
            "span",
          ],
          allowedAttributes: {
            a: ["href"],
          },
          transformTags: {
            a: (tagName, attribs) => {
              if (attribs.href) {
                return {
                  tagName,
                  attribs: {
                    ...attribs,
                    href: `https://framework.soodam.rocks/link?dest=${attribs.href}`,
                  },
                };
              }
              return { tagName, attribs };
            },
          },
        }),
        genre,
        maxPlayersPerSession: maxPlayers,
        author: {
          connect: {
            id: account.id,
          },
        },
        iconUri: "",
      },
    });

    return {
      success: true,
      game,
    };
  }

  @Post("/:id/comment")
  @Authorized()
  async comment(
    @Account() user: User,
    @Body() body: GameCommentBody,
    @Param("id") id: string,
  ) {
    const { body: commentBody } = body;

    const game = await prisma.game.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!game) {
      return {
        error: "Game not found",
      };
    }

    if (!commentBody) {
      return {
        error: "Invalid comment body",
      };
    }

    if (commentBody.length > 256) {
      return {
        error: "Comment body too long",
      };
    }

    const comment = await prisma.gameComment.create({
      data: {
        text: commentBody,
        user: {
          connect: {
            id: user.id,
          },
        },
        game: {
          connect: {
            id: game.id,
          },
        },
      },
      select: {
        text: true,
        user: nonCurrentUserSelect,
        createdAt: true,
      },
    });

    return {
      success: true,
      comment,
    };
  }

  @Post("/:id/connection/add")
  @Authorized()
  public async createConnection(
    @Account() user: User,
    @Param("id") id: string,
    @Body() body: CreateConnectionBody,
  ) {
    const { ip, port } = body;
    const game = await prisma.game.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!game) {
      return {
        error: "Game not found",
      };
    }

    if (game.authorId != user.id) {
      return {
        error: "You are not the author of this game",
      };
    }

    await prisma.connection.create({
      data: {
        ip,
        port,
        game: {
          connect: {
            id: game.id,
          },
        },
        nucleusKey: {
          create: {
            name: `"${game.name}" key`,
            user: {
              connect: {
                id: user.id,
              },
            }
          }
        }
      },
    });

    return {
      success: true,
    };
  }

  @Get("/typeahead")
  public async typeahead(
    @Query("q") q: string
  ) {
    const games = await prisma.game.findMany({
      where: {
        name: {
          contains: q,
        },
      },
      select: gameSelect,
    });

    return {
      games,
    };
  }

  @Get("/:page")
  @Authorized()
  async getGames(
    @Query("likes") likes: "asc" | "desc",
    @Query("dislikes") dislikes: "asc" | "desc",
    @Query("visits") visits: "asc" | "desc",
    @Query("genres") genres: GameGenre[] | null,
    @Param("page") page: number
  ) {
    const results = await prisma.game.findMany({
      where: {
        genre: genres
          ? {
              in: genres,
            }
          : {},
      },
      orderBy: [
        {
          likedBy: {
            _count: likes,
          },
        },
        {
          dislikedBy: {
            _count: dislikes,
          },
        },
        {
          visits: visits,
        },
      ],
      take: 10,
      select: gameSelect,
    });

    return results;
  }
}

export default createHandler(GameRouter);
