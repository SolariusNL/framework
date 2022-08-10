import { GameGenre } from "@prisma/client";
import {
  Body,
  createHandler,
  Get,
  Param,
  Post,
  Query,
} from "@storyofams/next-api-decorators";
import Authorized, { Account } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import { gameSelect, type User } from "../../../util/prisma-types";

interface GameCreateBody {
  gameName: string;
  description: string;
  genre: GameGenre;
  maxPlayers: number;
  communityGuidelines: boolean;
}

class GameRouter {
  @Post("/create")
  @Authorized()
  async createGame(@Body() body: GameCreateBody, @Account() account: User) {
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
        description,
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
