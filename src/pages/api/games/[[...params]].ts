import { scoreDescriptions } from "@/components/edit-game/age-rating";
import { parse } from "@/components/render-markdown";
import IResponseBase from "@/types/api/IResponseBase";
import Authorized, { Account } from "@/util/api/authorized";
import registerAutomodHandler from "@/util/automod";
import { Fwx } from "@/util/fwx";
import prisma from "@/util/prisma";
import {
  gameSelect,
  nonCurrentUserSelect,
  type User,
} from "@/util/prisma-types";
import { RateLimitMiddleware } from "@/util/rate-limit";
import { logTransaction } from "@/util/transaction-history";
import {
  Badge,
  GameEnvironment,
  GameGenre,
  GameUpdateLogType,
  Prisma,
  RatingCategory,
  RatingCategoryScore,
  RatingType,
  TransactionType,
} from "@prisma/client";
import {
  Body,
  createHandler,
  Delete,
  Get,
  Param,
  Post,
  Query,
  ValidationPipe,
} from "@solariusnl/next-api-decorators";
import * as Validate from "class-validator";
import { default as sanitize, default as sanitizeHtml } from "sanitize-html";
import { z } from "zod";

const commentAutomod = registerAutomodHandler("Game comment");
const gameCreateAutomod = registerAutomodHandler("Game creation");

interface GameCreateBody {
  gameName: string;
  description: string;
  genre: GameGenre;
  maxPlayers: number;
  communityGuidelines: boolean;
  access: "public" | "private" | "paid";
}

interface CreateConnectionBody {
  ip: string;
  port: number;
}

interface GameCommentBody {
  body: string;
}

interface UpdateRatingBody {
  type: RatingType;
  scores: Array<{
    category: RatingCategory;
    score: RatingCategoryScore;
    description: string;
  }>;
}

class CreateGamepassDTO {
  @Validate.IsString()
  @Validate.Length(1, 64, {
    message: "Gamepass name must be be less than 64 characters",
  })
  name: string;

  @Validate.IsString()
  @Validate.Length(1, 300, {
    message: "Gamepass description must be less than 300 characters",
  })
  description: string;

  @Validate.IsNumber()
  @Validate.Length(0, 1000000, {
    message: "Gamepass price must be between 0 and 1000000",
  })
  price: number;

  constructor(name: string, description: string, price: number) {
    this.name = name;
    this.description = description;
    this.price = price;
  }
}

const fundSanitization = {
  allowedTags: [
    "h3",
    "h4",
    "b",
    "i",
    "strong",
    "em",
    "a",
    "ul",
    "ol",
    "li",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "p",
    "br",
  ],
  allowedAttributes: {
    a: ["href"],
  },
};

class GameRouter {
  @Post("/create")
  @Authorized()
  @RateLimitMiddleware(10)()
  public async createGame(
    @Body() body: GameCreateBody,
    @Account() account: User
  ) {
    const {
      gameName,
      description,
      genre,
      maxPlayers,
      communityGuidelines,
      access,
    } = body;

    if (
      !gameName ||
      !description ||
      !genre ||
      !maxPlayers ||
      !communityGuidelines ||
      !Object.values(GameGenre).includes(genre) ||
      !Object.values(["public", "private", "paid"]).includes(access)
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
                    href: `https://framework.solarius.me/link?dest=${attribs.href}`,
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
        private: access === "private",
        paywall: access === "paid",
      },
    });

    gameCreateAutomod(account.id, gameName);
    gameCreateAutomod(account.id, description);

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
        id: true,
      },
    });

    commentAutomod(user.id, commentBody);

    return {
      success: true,
      comment,
    };
  }

  @Post("/:id/comment/:id/delete")
  @Authorized()
  async deleteComment(@Param("id") id: string, @Account() user: User) {
    const comment = await prisma.gameComment.findFirst({
      where: {
        id: String(id),
      },
      select: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!comment) {
      return {
        error: "Comment not found",
      };
    }

    if (comment.user.id !== user.id) {
      return {
        error: "You can only delete your own comments",
      };
    }

    await prisma.gameComment.delete({
      where: {
        id: String(id),
      },
    });

    return {
      success: true,
    };
  }

  @Post("/:id/comment/:id/edit")
  @Authorized()
  async editComment(
    @Param("id") id: string,
    @Account() user: User,
    @Body() body: { message: string }
  ) {
    const comment = await prisma.gameComment.findFirst({
      where: {
        id: String(id),
      },
      select: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!comment) {
      return {
        error: "Comment not found",
      };
    }

    if (comment.user.id !== user.id) {
      return {
        error: "You can only edit your own comments",
      };
    }

    if (body.message.length > 500) {
      return {
        error: "Comment body too long",
      };
    }

    if (!body.message) {
      return {
        error: "Invalid comment body",
      };
    }

    await prisma.gameComment.update({
      where: {
        id: String(id),
      },
      data: {
        text: body.message,
      },
    });

    return {
      success: true,
    };
  }

  @Get("/search")
  @Authorized()
  async searchGames(@Query("q") q: string) {
    const games = await prisma.game.findMany({
      where: {
        name: {
          contains: String(q),
          mode: "insensitive",
        },
        private: false,
      },
      select: gameSelect,
      take: 25,
    });

    return {
      success: true,
      games,
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
      include: {
        connection: true,
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

    if (game.connection.length > 0) {
      return {
        error: "You already have a connection for this game",
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
        private: false,
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
    @Query("filter") filterString: string = "",
    @Param("page") page: number
  ) {
    const parsed = JSON.parse(filterString);
    const filter:
      | "most_liked"
      | "least_liked"
      | "most_disliked"
      | "least_disliked"
      | "oldest"
      | "newest"
      | "most_visited"
      | "least_visited" = parsed.filter;
    const genre: GameGenre = parsed.genre;
    const search: string = parsed.search;
    const status: "online" | "offline" | "all" = parsed.status;

    const order = {
      most_liked: {
        likedBy: {
          _count: "desc",
        },
      },
      least_liked: {
        likedBy: {
          _count: "asc",
        },
      },
      most_disliked: {
        dislikedBy: {
          _count: "desc",
        },
      },
      least_disliked: {
        dislikedBy: {
          _count: "asc",
        },
      },
      oldest: {
        createdAt: "asc",
      },
      newest: {
        createdAt: "desc",
      },
      most_visited: {
        visits: "desc",
      },
      least_visited: {
        visits: "asc",
      },
    };

    const results = await prisma.game.findMany({
      where: {
        name: search ? { contains: search, mode: "insensitive" } : {},
        genre: genre ? { equals: genre as GameGenre } : {},
        private: false,
        connection: status
          ? {
              [status === "online"
                ? "some"
                : status === "offline"
                ? "none"
                : "every"]: {
                online:
                  status === "online"
                    ? true
                    : status === "offline"
                    ? false
                    : undefined,
              },
            }
          : {},
      },
      select: gameSelect,
      take: Number(25),
      skip: 25 * (Number(page) - 1),
      orderBy: [
        ...((filter
          ? [order[filter]]
          : [
              {
                likedBy: {
                  _count: "desc",
                },
              },
            ]) as Prisma.GameOrderByWithRelationInput[]),
      ],
    });

    return results || [];
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

    const updatable = [
      "name",
      "description",
      "genre",
      "maxPlayersPerSession",
      "private",
      "paywall",
      "paywallPrice",
      "privateAccess",
    ];
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
      {
        property: "copyrightMetadata",
        regex: undefined,
        error: "Invalid copyright metadata",
        validation: (value: any) => {
          return (
            value.length <= 5 &&
            value.every(
              (metadata: any) =>
                metadata.title.length >= 3 &&
                metadata.title.length <= 40 &&
                metadata.description.length >= 3 &&
                metadata.description.length <= 120
            )
          );
        },
        relation: true,
      },
      {
        property: "private",
        regex: /^true|false$/,
        error: "Invalid private value",
      },
      {
        property: "paywall",
        regex: /^true|false$/,
        error: "Invalid paywall value",
      },
      {
        property: "paywallPrice",
        regex: undefined,
        error: "Invalid paywall price",
        validation: (value: any) => {
          return value >= 1 && value <= 100000;
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

    if (body.copyrightMetadata) {
      await prisma.gameCopyrightMetadata.deleteMany({
        where: {
          gameId: Number(id),
        },
      });
    }

    if (body.privateAccess) {
      body.privateAccess.forEach(async (user: any) => {
        if (!user.id || !user.username) {
          return false;
        }

        const userExists = await prisma.user.findFirst({
          where: {
            id: user.id,
            username: user.username,
          },
        });

        if (!userExists) {
          return false;
        }
      });
    }

    await prisma.game.update({
      where: {
        id: Number(id),
      },
      data: {
        ...updatable.reduce((acc, field) => {
          if (body[field]) {
            (acc as any)[field] = body[field];
          }

          return acc;
        }, {}),
        ...(body.private !== undefined
          ? {
              private: body.private,
            }
          : {}),
        ...(body.paywall !== undefined
          ? {
              paywall: body.paywall,
            }
          : {}),
        ...(body.copyrightMetadata
          ? {
              copyrightMetadata: {
                create: body.copyrightMetadata.map((metadata: any) => ({
                  title: metadata.title,
                  description: metadata.description,
                })),
              },
            }
          : {}),
        ...(body.privateAccess
          ? {
              privateAccess: {
                set: body.privateAccess.map((user: any) => ({
                  id: user.id,
                })),
              },
            }
          : {}),
      },
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

    if (amount < 1) {
      return {
        success: false,
        error: "Invalid amount",
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
        donationCount: {
          increment: 1,
        },
      },
    });
    if (user.donationCount + 1 >= 10)
      await Fwx.Badges.grant(Badge.PHILANTHROPIST, user.id);

    await logTransaction(
      amount,
      "Donation to game fund for game: " + game.name,
      user.id,
      TransactionType.OUTBOUND,
      game.authorId
    );
    await logTransaction(
      amount,
      "Donation received for your game fund: " + fund.name,
      game.authorId,
      TransactionType.INBOUND,
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
    @Body() body: unknown
  ) {
    const schema = z.object({
      name: z.string().min(3).max(50),
      goal: z.number().min(50).max(1000000),
      description: z.string().min(3).max(1024),
    });

    try {
      schema.parse(body);
    } catch (e: any) {
      return {
        success: false,
        error: e.message,
      };
    }

    const data = schema.parse(body);

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

    const fund = await prisma.gameFund.create({
      data: {
        target: Number(data.goal),
        game: {
          connect: {
            id: Number(id),
          },
        },
        current: 0,
        name: String(data.name),
        descriptionMd: String(data.description),
        description: sanitize(parse(data.description), fundSanitization),
      },
    });

    return {
      success: true,
      fund,
    };
  }

  @Post("/:id/fund/:fundId/edit")
  @Authorized()
  async editFund(
    @Account() user: User,
    @Param("id") id: number,
    @Param("fundId") fundId: string,
    @Body() body: unknown
  ) {
    const schema = z.object({
      name: z.string().min(3).max(50),
      goal: z.number().min(50).max(1000000),
      description: z.string().min(3).max(1024),
    });

    try {
      schema.parse(body);
    } catch (e: any) {
      return {
        success: false,
        error: e.message,
      };
    }

    const data = schema.parse(body);

    const game = await prisma.game.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!game || game.authorId !== user.id) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    const fund = await prisma.gameFund.findFirst({
      where: {
        id: fundId,
      },
    });

    if (!fund) {
      return {
        success: false,
        error: "Fund not found",
      };
    }

    const f = await prisma.gameFund.update({
      where: {
        id: fundId,
      },
      data: {
        target: Number(data.goal),
        name: String(data.name),
        descriptionMd: String(data.description),
        description: sanitize(parse(data.description), fundSanitization),
      },
    });

    return {
      success: true,
      fund: f,
    };
  }

  @Delete("/:id/fund/:fundId")
  @Authorized()
  async deleteFund(
    @Account() user: User,
    @Param("id") id: number,
    @Param("fundId") fundId: string
  ) {
    const game = await prisma.game.findFirst({
      where: {
        id: Number(id),
      },
    });

    if (!game || game.authorId !== user.id) {
      return <IResponseBase>{
        success: false,
        message: "Game not found",
      };
    }

    const fund = await prisma.gameFund.findFirst({
      where: {
        id: fundId,
      },
    });

    if (!fund) {
      return <IResponseBase>{
        success: false,
        message: "Fund not found",
      };
    }

    await prisma.gameFund.delete({
      where: {
        id: fundId,
      },
    });

    return <IResponseBase>{
      success: true,
    };
  }

  @Get("/by/genre/:genre")
  async getGamesByGenre(
    @Param("genre") genre: string,
    @Query("exclude") gameId: number
  ) {
    const games = await prisma.game.findMany({
      where: {
        genre: genre as GameGenre,
        private: false,
        id: {
          not: Number(gameId),
        },
      },
      select: gameSelect,
      take: 10,
    });

    return <IResponseBase>{
      success: true,
      data: {
        games,
      },
    };
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

    if (scores.length !== 3) {
      return {
        success: false,
        error: "Invalid scores",
      };
    }

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

  @Post("/:id/gamepass/new")
  @Authorized()
  async newGamePass(
    @Account() user: User,
    @Param("id") id: number,
    @Body(ValidationPipe) body: CreateGamepassDTO
  ) {
    const game = await prisma.game.findFirst({
      where: {
        id: Number(id),
        authorId: user.id,
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

    const gamepass = await prisma.gamepass.create({
      data: {
        name: body.name,
        price: body.price,
        description: body.description,
        game: {
          connect: {
            id: Number(id),
          },
        },
        author: {
          connect: {
            id: user.id,
          },
        },
        priceBits: body.price * 10,
        previewUri: "",
      },
    });

    return {
      success: true,
      gamepass: {
        ...gamepass,
        owners: [],
      },
    };
  }

  @Post("/:id/gamepass/:gamepassId/delete")
  @Authorized()
  async deleteGamePass(
    @Account() user: User,
    @Param("id") id: number,
    @Param("gamepassId") gamepassId: string
  ) {
    const game = await prisma.game.findFirst({
      where: {
        id: Number(id),
        authorId: user.id,
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

    const gamepass = await prisma.gamepass.findFirst({
      where: {
        id: String(gamepassId),
        gameId: Number(id),
      },
    });

    if (!gamepass) {
      return {
        success: false,
        error: "Gamepass not found",
      };
    }

    await prisma.gamepass.delete({
      where: {
        id: String(gamepassId),
      },
    });

    return {
      success: true,
    };
  }

  @Get("/gamepasses/get")
  @Authorized()
  async getGamePasses(@Account() user: User) {
    const games = await prisma.game.findMany({
      where: {
        authorId: user.id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return games;
  }

  @Get("/following/:gid/status")
  @Authorized()
  async getFollowingStatus(@Account() user: User, @Param("gid") gid: string) {
    const game = await prisma.game.findFirst({
      where: {
        id: Number(gid),
        followers: {
          some: {
            id: user.id,
          },
        },
      },
    });

    return {
      following: !!game,
    };
  }

  @Post("/following/:gid/follow")
  @Authorized()
  async followGame(@Account() user: User, @Param("gid") gid: string) {
    const game = await prisma.game.findFirst({
      where: {
        id: Number(gid),
        followers: {
          some: {
            id: user.id,
          },
        },
      },
    });

    if (game) {
      await prisma.game.update({
        where: {
          id: Number(gid),
        },
        data: {
          followers: {
            disconnect: {
              id: user.id,
            },
          },
        },
      });
    } else {
      await prisma.game.update({
        where: {
          id: Number(gid),
        },
        data: {
          followers: {
            connect: {
              id: user.id,
            },
          },
        },
      });
    }

    return {
      success: true,
    };
  }

  @Get("/updates/:gid/:page")
  @Authorized()
  async getUpdates(
    @Account() user: User,
    @Param("gid") gid: string,
    @Param("page") page: number
  ) {
    const game = await prisma.game.findFirst({
      where: {
        id: Number(gid),
      },
    });
    const count = await prisma.gameUpdateLog.count({
      where: {
        gameId: Number(gid),
      },
    });

    if (!game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    const updates = await prisma.gameUpdateLog.findMany({
      where: {
        gameId: Number(gid),
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * 10,
      take: 10,
    });

    return {
      success: true,
      updates,
      pages: Math.ceil(count / 10),
    };
  }

  @Get("/updates/:gid/latest/tag")
  @Authorized()
  async getLatestUpdateTag(@Account() user: User, @Param("gid") gid: string) {
    const latest = await prisma.gameUpdateLog.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        gameId: Number(gid),
      },
    });

    return {
      tag: latest?.tag,
    };
  }

  @Post("/updates/:gid/create")
  @Authorized()
  async createUpdate(
    @Account() user: User,
    @Param("gid") gid: string,
    @Body() body: unknown
  ) {
    const schema = z.object({
      title: z.string().min(3).max(75),
      content: z.string().min(3).max(5000),
      tag: z
        .string()
        .regex(
          /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
          "Invalid tag"
        ),
      type: z.nativeEnum(GameUpdateLogType),
    });

    const data = schema.parse(body);

    const game = await prisma.game.findFirst({
      where: {
        id: Number(gid),
        authorId: user.id,
      },
    });

    if (!game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    const tags = await prisma.gameUpdateLog.findMany({
      where: {
        gameId: Number(gid),
      },
      select: {
        tag: true,
      },
    });

    if (tags.some((t) => t.tag === data.tag)) {
      return {
        success: false,
        error: "Tag already exists",
      };
    }

    await prisma.gameUpdateLog.create({
      data: {
        gameId: Number(gid),
        title: data.title,
        content: sanitizeHtml(data.content, {
          allowedTags: [
            "b",
            "i",
            "u",
            "ul",
            "ol",
            "li",
            "h4",
            "h5",
            "h6",
            "strong",
          ],
          allowedAttributes: {},
        }),
        tag: data.tag,
        type: data.type,
      },
    });

    return {
      success: true,
    };
  }

  @Get("/updates/following")
  @Authorized()
  async getFollowingUpdates(@Account() user: User) {
    const games = await prisma.game.findMany({
      where: {
        followers: {
          some: {
            id: user.id,
          },
        },
        updateLogs: {
          some: {},
        },
      },
      select: gameSelect,
    });

    return games;
  }

  @Post("/envs/:gid/create")
  @Authorized()
  async createEnv(
    @Account() user: User,
    @Param("gid") gid: string,
    @Body() body: unknown
  ) {
    const schema = z.object({
      name: z.string().min(1).max(75),
      value: z.string().min(1).max(1024),
      environment: z.nativeEnum(GameEnvironment),
    });

    const data = schema.parse(body);

    const game = await prisma.game.findFirst({
      where: {
        id: Number(gid),
        authorId: user.id,
      },
    });

    if (!game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    const v = await prisma.gameEnvironmentVariable.create({
      data: {
        gameId: Number(gid),
        name: data.name,
        value: data.value,
        environment: data.environment,
      },
    });

    return {
      success: true,
      variable: v,
    };
  }

  @Post("/envs/:gid/update/:id")
  @Authorized()
  async updateEnv(
    @Account() user: User,
    @Param("gid") gid: string,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const schema = z.object({
      name: z.string().min(1).max(75),
      value: z.string().min(1).max(1024),
      environment: z.nativeEnum(GameEnvironment),
    });

    const data = schema.parse(body);

    const game = await prisma.game.findFirst({
      where: {
        id: Number(gid),
        authorId: user.id,
      },
    });

    if (!game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    const v = await prisma.gameEnvironmentVariable.update({
      where: {
        id: String(id),
      },
      data: {
        name: data.name,
        value: data.value,
        environment: data.environment,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      variable: v,
    };
  }

  @Delete("/envs/:gid/delete/:id")
  @Authorized()
  async deleteEnv(
    @Account() user: User,
    @Param("gid") gid: string,
    @Param("id") id: string
  ) {
    const game = await prisma.game.findFirst({
      where: {
        id: Number(gid),
        authorId: user.id,
      },
    });

    if (!game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    await prisma.gameEnvironmentVariable.delete({
      where: {
        id: String(id),
      },
    });

    return {
      success: true,
    };
  }

  @Get("/comments/:gid/:page")
  async getComments(@Param("gid") gid: string, @Param("page") page: string) {
    const comments = await prisma.gameComment.findMany({
      where: {
        gameId: Number(gid),
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: Number((Number(page) - 1) * 8),
      take: 8,
      select: {
        user: nonCurrentUserSelect,
        text: true,
        createdAt: true,
        id: true,
      },
    });
    const len = await prisma.gameComment.count({
      where: {
        gameId: Number(gid),
      },
    });

    return <IResponseBase>{
      success: true,
      data: {
        comments,
        pages: Math.ceil(len / 8),
      },
    };
  }
}

export default createHandler(GameRouter);
