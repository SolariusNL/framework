import IResponseBase from "@/types/api/IResponseBase";
import Authorized, { Account } from "@/util/api/authorized";
import prisma from "@/util/prisma";
import { nonCurrentUserSelect, NonUser, type User } from "@/util/prisma-types";
import {
  LimitedCatalogItemReceipt,
  LimitedCatalogItemResell,
} from "@prisma/client";
import {
  Body,
  createHandler,
  Get,
  Param,
  Post,
  Query,
} from "@storyofams/next-api-decorators";
import { z } from "zod";

export type GetLimitedRecentAveragePriceResponse = IResponseBase<{
  rap: number;
}>;
export type GetLimitedPriceResponse = IResponseBase<{
  price: number;
}>;
export type PostLimitedResellResponse = IResponseBase<{}>;
export type GetChartDataResponse = IResponseBase<{
  data: ChartData[];
}>;
export type GetAveragePriceByDayResponse = IResponseBase<{
  averagePriceData: AveragePriceByDay[];
}>;
export type GetResellersResponse = IResponseBase<{
  resellers: LimitedCatalogItemResellWithSeller[];
}>;
export type LimitedCatalogItemResellWithSeller = LimitedCatalogItemResell & {
  seller: NonUser;
};
export type GetCatalogItemOwnershipStatusResponse = IResponseBase<{
  owned: boolean;
  copies?: Array<{
    id: string;
    count: number;
  }>;
}>;

export interface AveragePriceByDay {
  timestamp: Date;
  averagePrice: number;
}

export interface ChartData {
  timestamp: Date;
  price: number;
}

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
      },
    });

    if (!limited)
      return <GetLimitedRecentAveragePriceResponse>{
        success: false,
        message: "No limited item found with this id",
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
          recentAveragePrice: averageSalePrice || limited.price,
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
      },
    });

    if (!limited)
      return <GetLimitedPriceResponse>{
        success: false,
        message: "No limited item found with this id",
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
      if (limited.stock === 0) {
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
      return <GetLimitedPriceResponse>{
        success: true,
        data: {
          price: limited.price,
        },
      };
    }

    if (limited.stock > 0) {
      return <GetLimitedPriceResponse>{
        success: true,
        data: {
          price: limited.price,
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

  @Get("/sku/:id/resellers")
  @Authorized()
  public async getLimitedResellers(@Param("id") id: string) {
    const resells = await prisma.limitedCatalogItemResell.findMany({
      where: {
        itemId: id,
      },
      orderBy: {
        price: "asc",
      },
      include: {
        seller: {
          select: nonCurrentUserSelect.select,
        },
      },
    });

    return <GetResellersResponse>{
      success: true,
      data: {
        resellers: resells,
      },
    };
  }

  @Get("/sku/:id/chart-data")
  @Authorized()
  public async getChartData(@Param("id") id: string) {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const receipts = await prisma.limitedCatalogItemReceipt.findMany({
        where: {
          itemId: id,
          createdAt: {
            gte: sixMonthsAgo,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const groupedData = groupByMonthAndCalculateAverage(receipts);

      return <GetChartDataResponse>{
        success: true,
        data: {
          data: groupedData,
        },
      };
    } catch (error) {
      return <GetChartDataResponse>{
        success: false,
        message: "Internal server error",
      };
    }
    function groupByMonthAndCalculateAverage(
      receipts: LimitedCatalogItemReceipt[]
    ): ChartData[] {
      const groupedData: { [month: string]: number[] } = {};

      for (const receipt of receipts) {
        const date = new Date(receipt.createdAt);
        const yearMonth = `${date.getFullYear()}-${date.getMonth()}`;

        if (!groupedData[yearMonth]) {
          groupedData[yearMonth] = [];
        }

        groupedData[yearMonth].push(receipt.salePrice);
      }

      const chartData: ChartData[] = [];
      for (const month in groupedData) {
        const averagePrice =
          groupedData[month].reduce((sum, price) => sum + price, 0) /
          groupedData[month].length;
        chartData.push({
          timestamp: new Date(`${month}-01`),
          price: averagePrice,
        });
      }

      return chartData;
    }
  }

  @Get("/sku/:id/average-price-by-day")
  @Authorized()
  public async getAveragePriceByDay(
    @Param("id") id: string,
    @Query("year") year: number,
    @Query("month") month: number
  ) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const receipts = await prisma.limitedCatalogItemReceipt.findMany({
        where: {
          itemId: id,
          createdAt: {
            gte: startDate.toISOString(),
            lt: endDate.toISOString(),
          },
        },
      });
      console.log(receipts.length);

      const averagePriceData = calculateAveragePriceByDay(receipts);

      return <GetAveragePriceByDayResponse>{
        success: true,
        data: {
          averagePriceData,
        },
      };
    } catch (error) {
      return <GetAveragePriceByDayResponse>{
        success: false,
        message: "Internal server error",
      };
    }
    function calculateAveragePriceByDay(
      receipts: LimitedCatalogItemReceipt[]
    ): AveragePriceByDay[] {
      const averagePriceData: { [day: string]: number[] } = {};

      for (const receipt of receipts) {
        const date = new Date(receipt.createdAt);
        const dayKey = `${date.getFullYear()}-${
          date.getMonth() + 1
        }-${date.getDate()}`;

        if (!averagePriceData[dayKey]) {
          averagePriceData[dayKey] = [];
        }

        averagePriceData[dayKey].push(receipt.salePrice);
      }

      const result: AveragePriceByDay[] = [];
      for (const day in averagePriceData) {
        const averagePrice =
          averagePriceData[day].reduce((sum, price) => sum + price, 0) /
          averagePriceData[day].length;
        result.push({
          timestamp: new Date(day),
          averagePrice,
        });
      }

      return result;
    }
  }

  @Post("/sku/:id/buy")
  @Authorized()
  public async postLimitedBuy(
    @Param("id") id: string,
    @Account() user: User,
    @Query("price") price: number,
    @Query("resellId") resellId?: string,
    @Query("type") type?: "limited" | "limited-resell" | "normal"
  ) {
    price = Number(price);

    if (!price) {
      return <IResponseBase>{
        success: false,
        message: "No price provided",
      };
    }

    if (type === "normal") {
      const catalogItem = await prisma.catalogItem.findFirst({
        where: {
          id,
          onSale: true,
        },
      });

      if (!catalogItem) {
        return <IResponseBase>{
          success: false,
          message: "No catalog item found with this id that is on sale",
        };
      }

      if (catalogItem.price !== price) {
        return <IResponseBase>{
          success: false,
          message: "Price does not match",
        };
      }
      if (price > user.tickets) {
        return <IResponseBase>{
          success: false,
          message: "You do not have enough tickets",
        };
      }

      const inventory = await prisma.inventory.findFirst({
        where: {
          userId: user.id,
        },
      });

      if (!inventory) {
        await prisma.inventory.create({
          data: {
            userId: user.id,
          },
        });
      }

      const owned = await prisma.inventory.findFirst({
        where: {
          userId: user.id,
          items: {
            some: {
              id,
            },
          },
        },
      });

      if (owned) {
        return <IResponseBase>{
          success: false,
          message:
            "You already own this item - normal items are not resellable",
        };
      }

      await prisma.inventory.update({
        where: {
          userId: user.id,
        },
        data: {
          items: {
            connect: {
              id: id,
            },
          },
          user: {
            update: {
              tickets: {
                decrement: price,
              },
            },
          },
        },
      });

      return <IResponseBase>{
        success: true,
      };
    } else if (type === "limited") {
      const limited = await prisma.limitedCatalogItem.findFirst({
        where: {
          id,
          onSale: true,
        },
      });

      if (!limited) {
        return <IResponseBase>{
          success: false,
          message: "No limited item found with this id that is on sale",
        };
      }

      if (limited.stock === 0) {
        return <IResponseBase>{
          success: false,
          message: "This item is out of stock - you need to buy from resellers",
        };
      }

      if (limited.price !== price) {
        return <IResponseBase>{
          success: false,
          message: "Price does not match",
        };
      }

      if (price > user.tickets) {
        return <IResponseBase>{
          success: false,
          message: "You do not have enough tickets",
        };
      }

      const inventory = await prisma.inventory.findFirst({
        where: {
          userId: user.id,
        },
      });

      if (!inventory) {
        await prisma.inventory.create({
          data: {
            userId: user.id,
          },
        });
      }

      await prisma.inventory.update({
        where: {
          userId: user.id,
        },
        data: {
          limited: {
            create: {
              itemId: id,
              count: 1,
            },
          },
          user: {
            update: {
              tickets: {
                decrement: price,
              },
            },
          },
        },
      });

      await prisma.limitedCatalogItem.update({
        where: {
          id,
        },
        data: {
          quantitySold: {
            increment: 1,
          },
          stock: {
            decrement: 1,
          },
        },
      });

      return <IResponseBase>{
        success: true,
      };
    } else if (type === "limited-resell") {
      const resell = await prisma.limitedCatalogItemResell.findFirst({
        where: {
          id: resellId,
          itemId: id,
        },
      });

      if (!resell) {
        return <IResponseBase>{
          success: false,
          message: "No resell found with this id, sellerId and price",
        };
      }

      if (resell.sellerId === user.id) {
        return <IResponseBase>{
          success: false,
          message: "You cannot buy from yourself - that's not how this works",
        };
      }

      if (resell.price !== price) {
        return <IResponseBase>{
          success: false,
          message: "Price does not match",
        };
      }
      if (resell.price > user.tickets) {
        return <IResponseBase>{
          success: false,
          message: "You do not have enough tickets",
        };
      }

      const inventory = await prisma.inventory.findFirst({
        where: {
          userId: user.id,
        },
      });

      if (!inventory) {
        await prisma.inventory.create({
          data: {
            userId: user.id,
          },
        });
      }

      const owned = await prisma.limitedInventoryItem.findFirst({
        where: {
          inventory: {
            userId: user.id,
          },
          itemId: id,
        },
      });

      if (owned) {
        await prisma.limitedInventoryItem.update({
          where: {
            id: owned.id,
          },
          data: {
            count: {
              increment: 1,
            },
          },
        });
      } else {
        await prisma.limitedInventoryItem.create({
          data: {
            inventory: {
              connect: {
                userId: user.id,
              },
            },
            item: {
              connect: {
                id,
              },
            },
            count: 1,
          },
        });
      }

      await prisma.user.update({
        where: {
          id: resell.sellerId,
        },
        data: {
          tickets: {
            increment: price,
          },
        },
      });
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          tickets: {
            decrement: price,
          },
        },
      });

      await prisma.limitedCatalogItemResell.delete({
        where: {
          id: resell.id,
        },
      });
      await prisma.limitedCatalogItemReceipt.create({
        data: {
          itemId: id,
          salePrice: price,
          buyerId: user.id,
        },
      });
    } else {
      return <IResponseBase>{
        success: false,
        message: "Reseller does not own this item... somehow",
      };
    }

    return <IResponseBase>{
      success: true,
    };
  }

  @Get("/sku/:id/ownership-status")
  @Authorized()
  public async getCatalogItemOwnershipStatus(
    @Param("id") id: string,
    @Account() user: User,
    @Query("type") type?: "limited" | "normal" | "sound"
  ) {
    if (type === "normal") {
      const catalogItem = await prisma.catalogItem.findFirst({
        where: {
          id,
        },
      });

      if (!catalogItem) {
        return <GetCatalogItemOwnershipStatusResponse>{
          success: false,
          message: "No catalog item found with this id",
        };
      }

      const owned = await prisma.inventory.findFirst({
        where: {
          userId: user.id,
          items: {
            some: {
              id,
            },
          },
        },
      });

      return <GetCatalogItemOwnershipStatusResponse>{
        success: true,
        data: {
          owned: !!owned,
        },
      };
    } else if (type === "limited") {
      const limited = await prisma.limitedCatalogItem.findFirst({
        where: {
          id,
        },
      });

      if (!limited) {
        return <GetCatalogItemOwnershipStatusResponse>{
          success: false,
          message: "No limited item found with this id",
        };
      }

      const owned = await prisma.limitedInventoryItem.findFirst({
        where: {
          inventory: {
            userId: user.id,
          },
          itemId: id,
        },
      });

      return <GetCatalogItemOwnershipStatusResponse>{
        success: true,
        data: {
          owned: !!owned,
          copies: owned
            ? await prisma.limitedInventoryItem.findMany({
                where: {
                  itemId: id,
                  inventory: {
                    userId: user.id,
                  },
                },
              })
            : undefined,
        },
      };
    } else if (type === "sound") {
      return <GetCatalogItemOwnershipStatusResponse>{
        success: false,
        data: {
          owned: false,
        },
        message: "Unimplemented",
      };
    }
  }

  @Post("/sku/:id/sell")
  @Authorized()
  public async postLimitedSell(
    @Param("id") id: string,
    @Account() user: User,
    @Query("price") price: number,
    @Query("count") count: number,
    @Query("serial") serial: string
  ) {
    if (!price) {
      return <IResponseBase>{
        success: false,
        message: "No price provided",
      };
    }

    if (!count) {
      return <IResponseBase>{
        success: false,
        message: "No count provided",
      };
    }

    if (!serial) {
      return <IResponseBase>{
        success: false,
        message: "No serial provided",
      };
    }

    price = Number(price);
    count = Number(count);

    const limited = await prisma.limitedInventoryItem.findFirst({
      where: {
        itemId: id,
        id: serial,
        inventory: {
          userId: user.id,
        },
      },
    });

    if (!limited) {
      return <IResponseBase>{
        success: false,
        message: "You do not own this item",
      };
    }

    if (limited.count < count) {
      return <IResponseBase>{
        success: false,
        message: "You do not own this many of this item",
      };
    }

    if (limited.count === count) {
      await prisma.limitedInventoryItem.delete({
        where: {
          id: serial,
        },
      });
    } else {
      await prisma.limitedInventoryItem.update({
        where: {
          id: serial,
        },
        data: {
          count: {
            decrement: count,
          },
        },
      });
    }

    await prisma.limitedCatalogItemResell.create({
      data: {
        itemId: id,
        price,
        sellerId: user.id,
      },
    });
    await prisma.limitedCatalogItem.update({
      where: {
        id,
      },
      data: {
        onSale: true,
      },
    });

    return <IResponseBase>{
      success: true,
    };
  }
}

export default createHandler(CatalogRouter);
