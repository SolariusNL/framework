import {
  Body,
  Get,
  Param,
  Post,
  createHandler,
} from "@storyofams/next-api-decorators";
import { z } from "zod";
import IResponseBase from "@/types/api/IResponseBase";
import Authorized, { Account } from "@/util/api/authorized";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";

type GetLimitedRecentAveragePriceResponse = IResponseBase<{
  rap: number;
}>;
type GetLimitedPriceResponse = IResponseBase<{
  price: number;
}>;
type PostLimitedResellResponse = IResponseBase<{}>;

const postLimitedResellSchema = z.object({
  price: z.number().min(1),
});

class CatalogRouter {
  @Get("/sku/:id/rap")
  @Authorized()
  public async getLimitedRecentAveragePrice(@Param("id") id: string) {
    const limited = await prisma.limitedCatalogItem.findFirst({
      where: {
        id,
        onSale: true,
      },
    });

    if (!limited)
      return <GetLimitedRecentAveragePriceResponse>{
        success: false,
        message: "No limited item found with this id that is on sale",
      };

    if (
      limited.rapLastUpdated &&
      new Date(limited.rapLastUpdated) > new Date(Date.now() - 1000 * 60 * 30)
    ) {
      return <GetLimitedRecentAveragePriceResponse>{
        success: true,
        data: {
          rap: limited.recentAveragePrice,
        },
      };
    } else {
      const receipts = await prisma.limitedCatalogItemReceipt.findMany({
        where: {
          itemId: id,
          createdAt: {
            gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 120,
      });

      const totalSalePrice = receipts.reduce(
        (sum, receipt) => sum + receipt.salePrice,
        0
      );
      const averageSalePrice = Math.round(totalSalePrice / receipts.length);

      await prisma.limitedCatalogItem.update({
        where: {
          id,
        },
        data: {
          recentAveragePrice: averageSalePrice,
          rapLastUpdated: new Date(),
        },
      });

      return <GetLimitedRecentAveragePriceResponse>{
        success: true,
        data: {
          rap: averageSalePrice,
        },
      };
    }
  }

  @Get("/sku/:id/price")
  @Authorized()
  public async getLimitedPrice(@Param("id") id: string) {
    const limited = await prisma.limitedCatalogItem.findFirst({
      where: {
        id,
        onSale: true,
      },
    });

    if (!limited)
      return <GetLimitedPriceResponse>{
        success: false,
        message: "No limited item found with this id that is on sale",
      };

    const resells = await prisma.limitedCatalogItemResell.findMany({
      where: {
        itemId: id,
      },
      orderBy: {
        price: "asc",
      },
      take: 1,
    });

    if (resells.length === 0) {
      await prisma.limitedCatalogItem.update({
        where: {
          id,
        },
        data: {
          onSale: false,
        },
      });

      return <GetLimitedPriceResponse>{
        success: true,
        data: {
          price: 0,
        },
      };
    }

    await prisma.limitedCatalogItem.update({
      where: {
        id,
      },
      data: {
        price: resells[0].price,
      },
    });

    return <GetLimitedPriceResponse>{
      success: true,
      data: {
        price: resells[0].price,
      },
    };
  }

  @Post("/sku/:id/resell")
  @Authorized()
  public async postLimitedResell(
    @Param("id") id: string,
    @Body() body: z.infer<typeof postLimitedResellSchema>,
    @Account() user: User
  ) {
    if (!body) {
      return <PostLimitedResellResponse>{
        success: false,
        message: "No body provided",
      };
    }

    const invItem = await prisma.limitedInventoryItem.findFirst({
      where: {
        inventory: {
          userId: user.id,
        },
        itemId: id,
      },
    });

    if (!invItem) {
      return <PostLimitedResellResponse>{
        success: false,
        message: "You do not own this item",
      };
    }

    await prisma.limitedCatalogItemResell.create({
      data: {
        itemId: invItem.itemId,
        price: body.price,
        sellerId: user.id,
      },
    });

    if (invItem.count === 1) {
      await prisma.limitedInventoryItem.delete({
        where: {
          id: invItem.id,
        },
      });
    } else {
      await prisma.limitedInventoryItem.update({
        where: {
          id: invItem.id,
        },
        data: {
          count: {
            decrement: 1,
          },
        },
      });
    }

    await prisma.limitedCatalogItem.update({
      where: {
        id: invItem.itemId,
      },
      data: {
        onSale: true,
      },
    });

    return <PostLimitedResellResponse>{
      success: true,
    };
  }
}

export default createHandler(CatalogRouter);
