import IResponseBase from "@/types/api/IResponseBase";
import prisma from "@/util/prisma";
import {
  AssetFrontend,
  assetItemTypeWithTypeProp,
  prismaAssetItemTypeModelMap,
  type AssetItemType,
} from "@/util/types";
import { CatalogItemType, Prisma } from "@prisma/client";
import {
  Get,
  Param,
  Query,
  createHandler,
} from "@storyofams/next-api-decorators";

export type GetInventoryItemsByTypeResponse = IResponseBase<{
  items: AssetFrontend[];
}>;

class InventoryRouter {
  @Get("/:uid/inventory")
  public async getInventoryItemsByType(
    @Param("uid") uid: number,
    @Query("type") type: AssetItemType
  ) {
    if (!uid || !type)
      return <GetInventoryItemsByTypeResponse>{
        success: false,
        error: "Missing uid or type",
      };

    uid = parseInt(uid.toString());

    if (type === "limiteds") {
      const items = await prisma.limitedInventoryItem.findMany({
        where: {
          inventory: {
            userId: uid,
          },
        },
        include: {
          item: true,
        },
      });

      return <GetInventoryItemsByTypeResponse>{
        success: true,
        data: {
          items: items.map((item) => item.item) as never as AssetFrontend[],
        },
      };
    }

    const queryExecutor = prisma[
      prismaAssetItemTypeModelMap[type]
    ] as never as {
      findMany: (
        args: Prisma.CatalogItemFindFirstArgs
      ) => Promise<AssetFrontend[]>;
    };
    const hasType = assetItemTypeWithTypeProp.includes(type);

    const items = await queryExecutor.findMany({
      where: {
        apartOf: {
          some: {
            userId: uid,
          },
        },
        ...(hasType ? { type: type.toUpperCase() as CatalogItemType } : {}),
      },
    });

    return <GetInventoryItemsByTypeResponse>{
      success: true,
      data: {
        items,
      },
    };
  }
}

export default createHandler(InventoryRouter);
