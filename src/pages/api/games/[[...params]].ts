import { GameGenre } from "@prisma/client";
import {
  createHandler,
  Get,
  Param,
  Query,
} from "@storyofams/next-api-decorators";
import Authorized from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import { gameSelect } from "../../../util/prisma-types";

class GameRouter {
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
      select: gameSelect
    });

    return results;
  }
}

export default createHandler(GameRouter);
