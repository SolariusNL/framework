import {
  GameGenre,
  RatingCategory,
  RatingCategoryScore,
  RatingType,
} from "@prisma/client";
import {
  Body,
  createHandler,
  Get,
  Param,
  Post,
  Query,
} from "@storyofams/next-api-decorators";
import sanitizeHtml from "sanitize-html";
import { scoreDescriptions } from "../../../components/EditGame/AgeRating";
import Authorized, { Account } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import {
  gameSelect,
  nonCurrentUserSelect,
  type User,
} from "../../../util/prisma-types";
import { RateLimitMiddleware } from "../../../util/rateLimit";
import { logTransaction } from "../../../util/transactionHistory";

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

interface CreateFundBody {
  name: string;
  goal: number;
}

interface UpdateRatingBody {
  type: RatingType;
  scores: Array<{
    category: RatingCategory;
    score: RatingCategoryScore;
    description: string;
  }>;
}

class GameRouter {
  @Post("/create")
  @Authorized()
  @RateLimitMiddleware(10)()
  public async createGame(
    @Body() body: GameCreateBody,
    @Account() account: User
  ) {
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

    if (gameName.length > 40 || description.length > 4000 || maxPlayers > 50) {
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
    @Param("id") id: string
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

    if (commentBody.length > 500) {
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
    @Body() body: CreateConnectionBody
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
            },
          },
        },
      },
    });

    return {
      success: true,
    };
  }

  @Post("/:id/like")
  @Authorized()
  public async likeGame(@Account() user: User, @Param("id") id: string) {
    const game = await prisma.game.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        likedBy: true,
      },
    });

    if (!game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    await prisma.game.update({
      where: {
        id: Number(id),
      },
      data: {
        likedBy: {
          ...(game.likedBy.find((like) => like.id == user.id)
            ? {
                disconnect: {
                  id: user.id,
                },
              }
            : {
                connect: {
                  id: user.id,
                },
              }),
        },
      },
    });

    return {
      success: true,
    };
  }

  @Post("/:id/dislike")
  @Authorized()
  public async dislikeGame(@Account() user: User, @Param("id") id: string) {
    const game = await prisma.game.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        dislikedBy: true,
      },
    });

    if (!game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    await prisma.game.update({
      where: {
        id: Number(id),
      },
      data: {
        dislikedBy: {
          ...(game.dislikedBy.find((like) => like.id == user.id)
            ? {
                disconnect: {
                  id: user.id,
                },
              }
            : {
                connect: {
                  id: user.id,
                },
              }),
        },
      },
    });

    return {
      success: true,
    };
  }

  @Post("/:id/:commentId/upvote")
  @Authorized()
  public async upvoteComment(
    @Account() user: User,
    @Param("id") id: number,
    @Param("commentId") commentId: string
  ) {
    const comment = await prisma.gameComment.findFirst({
      where: {
        id: String(commentId),
      },
      include: {
        upvotedBy: true,
      },
    });

    if (!comment) {
      return {
        success: false,
        error: "Comment not found",
      };
    }

    await prisma.gameComment.update({
      where: {
        id: String(commentId),
      },
      data: {
        upvotedBy: {
          ...(comment.upvotedBy.find((like) => like.id == user.id)
            ? {
                disconnect: {
                  id: user.id,
                },
              }
            : {
                connect: {
                  id: user.id,
                },
              }),
        },
      },
    });

    return {
      success: true,
    };
  }

  @Post("/:id/:commentId/downvote")
  @Authorized()
  public async downvoteComment(
    @Account() user: User,
    @Param("id") id: number,
    @Param("commentId") commentId: string
  ) {
    const comment = await prisma.gameComment.findFirst({
      where: {
        id: String(commentId),
      },
      include: {
        downvotedBy: true,
      },
    });

    if (!comment) {
      return {
        success: false,
        error: "Comment not found",
      };
    }

    await prisma.gameComment.update({
      where: {
        id: String(commentId),
      },
      data: {
        downvotedBy: {
          ...(comment.downvotedBy.find((like) => like.id == user.id)
            ? {
                disconnect: {
                  id: user.id,
                },
              }
            : {
                connect: {
                  id: user.id,
                },
              }),
        },
      },
    });

    return {
      success: true,
    };
  }

  @Get("/typeahead")
  public async typeahead(@Query("q") q: string) {
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

  @Post("/:id/update")
  @Authorized()
  async updateGame(
    @Account() user: User,
    @Param("id") id: string,
    @Body() body: any
  ) {
    const game = await prisma.game.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    if (game.authorId !== user.id) {
      return {
        success: false,
        error: "You don't own this game",
      };
    }

    const updatable = ["name", "description", "genre", "maxPlayersPerSession"];
    const updatableData = [
      {
        property: "name",
        regex: /^.{3,40}$/,
        error: "Name must be between 3 and 40 characters",
      },
      {
        property: "description",
        regex: /^.{3,4000}$/,
        error: "Description must be between 3 and 4000 characters",
      },
      {
        property: "genre",
        regex: undefined,
        error: "Invalid genre",
        validation: (value: any) => {
          return Object.values(GameGenre).includes(value);
        },
      },
      {
        property: "maxPlayersPerSession",
        regex: undefined,
        error: "Invalid max players per session",
        validation: (value: any) => {
          return value >= 1 && value <= 100;
        },
      },
    ];

    const errors = [];

    for (const field of updatableData) {
      if (body[field.property]) {
        if (field.regex && !field.regex.test(body[field.property])) {
          errors.push(field.error);
        } else if (
          field.validation &&
          !field.validation(body[field.property])
        ) {
          errors.push(field.error);
        }
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    await prisma.game.update({
      where: {
        id: Number(id),
      },
      data: updatable
        .map((field) => ({
          [field]: body[field],
        }))
        .reduce((a, b) => ({ ...a, ...b })),
    });

    return {
      success: true,
    };
  }

  @Post("/:id/fund/:fundId/donate/:amount")
  @Authorized()
  async donate(
    @Account() user: User,
    @Param("id") id: number,
    @Param("fundId") fundId: string,
    @Param("amount") amount: number
  ) {
    const game = await prisma.game.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        funds: true,
      },
    });

    if (!game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    const fund = game.funds.find((fund) => fund.id == fundId);

    if (!fund) {
      return {
        success: false,
        error: "Fund not found",
      };
    }

    if (user.tickets < Number(amount)) {
      return {
        success: false,
        error: "You don't have enough tickets",
      };
    }

    if (game.authorId == user.id) {
      return {
        success: false,
        error: "You can't donate to your own fund",
      };
    }

    await prisma.game.update({
      where: {
        id: Number(id),
      },
      data: {
        funds: {
          update: {
            where: {
              id: fundId,
            },
            data: {
              current: {
                increment: Number(amount),
              },
            },
          },
        },
      },
    });

    await prisma.user.update({
      where: {
        id: game.authorId,
      },
      data: {
        tickets: {
          increment: Number(amount),
        },
      },
    });

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        tickets: {
          decrement: Number(amount),
        },
      },
    });

    await logTransaction(
      "Game fund " + fund.name,
      amount,
      "Donated to game fund for " + game.name + " (" + game.id + ")",
      user.id
    );

    return {
      success: true,
    };
  }

  @Post("/:id/fund/create")
  @Authorized()
  async createFund(
    @Account() user: User,
    @Param("id") id: number,
    @Body() body: CreateFundBody
  ) {
    const game = await prisma.game.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    if (game.authorId !== user.id) {
      return {
        success: false,
        error: "You don't own this game",
      };
    }

    if (body.goal < 1 || body.goal > 1000000) {
      return {
        success: false,
        error: "Invalid amount",
      };
    }

    if (body.name.length < 3 || body.name.length > 120) {
      return {
        success: false,
        error: "Invalid name",
      };
    }

    const fund = await prisma.gameFund.create({
      data: {
        target: Number(body.goal),
        game: {
          connect: {
            id: Number(id),
          },
        },
        current: 0,
        name: String(body.name),
      },
    });

    return {
      success: true,
      fund,
    };
  }

  @Get("/by/genre/:genre")
  async getGamesByGenre(@Param("genre") genre: string) {
    const games = await prisma.game.findMany({
      where: {
        genre: genre as GameGenre,
      },
      select: gameSelect,
      take: 10,
    });

    return games;
  }

  @Post("/:id/rating/update")
  @Authorized()
  async updateRating(
    @Account() user: User,
    @Body() body: UpdateRatingBody,
    @Param("id") id: number
  ) {
    const { type, scores } = body;

    const game = await prisma.game.findFirst({
      where: {
        id: Number(id),
        authorId: user.id,
      },
      include: {
        rating: true,
      },
    });

    if (!game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    if (!Object.values(RatingType).includes(type)) {
      return {
        success: false,
        error: "Invalid rating type",
      };
    }

    // can only be 3 scores
    if (scores.length !== 3) {
      return {
        success: false,
        error: "Invalid scores",
      };
    }

    // check scores
    for (const score of scores) {
      if (!Object.values(RatingCategory).includes(score.category)) {
        return {
          success: false,
          error: "Invalid score category",
        };
      }

      if (!Object.values(RatingCategoryScore).includes(score.score)) {
        return {
          success: false,
          error: "Invalid score",
        };
      }

      if (!scoreDescriptions[score.category][score.score]) {
        return {
          success: false,
          error: "Invalid score description",
        };
      }

      await prisma.ratingScore.deleteMany({
        where: {
          rating: {
            gameId: game.id,
          },
        },
      });

      await prisma.rating.deleteMany({
        where: {
          gameId: game.id,
        },
      });

      await prisma.rating.create({
        data: {
          type: type,
          scores: {
            create: scores.map((score) => ({
              category: score.category,
              score: score.score,
              description: score.description,
            })),
          },
          game: {
            connect: {
              id: Number(id),
            },
          },
        },
      });

      return {
        success: true,
      };
    }
  }
}

export default createHandler(GameRouter);
