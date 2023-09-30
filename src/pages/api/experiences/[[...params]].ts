import IResponseBase from "@/types/api/IResponseBase";
import Authorized, { Account } from "@/util/api/authorized";
import { assetFrontendInclude } from "@/util/includes";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import { AssetFrontend } from "@/util/types";
import { Get, Param, createHandler } from "@solariusnl/next-api-decorators";

export type GetGameGamepassesResponse = IResponseBase<{
  gamepasses: AssetFrontend[];
}>;

class GamesV2Router {
  @Get("/:gid/gamepasses")
  @Authorized()
  public async getGamepasses(@Param("gid") gid: number, @Account() user: User) {
    if (!gid)
      return <GetGameGamepassesResponse>{
        success: false,
        message: "Missing gid param",
      };

    gid = parseInt(gid.toString());

    const game = await prisma.game.findUnique({
      where: {
        id: gid,
      },
    });

    if (!game)
      return <GetGameGamepassesResponse>{
        success: false,
        message: "Game not found",
      };

    const gamepasses = (await prisma.gamepass.findMany({
      where: {
        gameId: gid,
      },
      include: assetFrontendInclude,
    })) as never as AssetFrontend[];

    return <GetGameGamepassesResponse>{
      success: true,
      data: {
        gamepasses,
      },
    };
  }
}

export default createHandler(GamesV2Router);
