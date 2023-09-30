import IResponseBase from "@/types/api/IResponseBase";
import Authorized, { Account } from "@/util/api/authorized";
import prisma from "@/util/prisma";
import { nonCurrentUserSelect, NonUser, type User } from "@/util/prisma-types";
import type { AssetFrontend, AssetItemType, AssetType } from "@/util/types";
import {
  assetItemTypeWithTypeProp,
  prismaAssetItemTypeModelMap,
  prismaAssetItemTypeViewMap,
  prismaAssetTypeMap,
  prismaInventoryMapping,
} from "@/util/types";
import {
  CatalogItem,
  CatalogItemType,
  Inventory,
  LimitedCatalogItemReceipt,
  LimitedCatalogItemResell,
  NotificationType,
  Prisma,
  TransactionType,
} from "@prisma/client";
import {
  Body,
  createHandler,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@solariusnl/next-api-decorators";
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
export type GetAssetStargazingStatusResponse = IResponseBase<{
  stargazing: boolean;
}>;
export type GetCatalogBrowseAssetsResponse = IResponseBase<{
  assets: AssetFrontend[];
}>;

export interface AveragePriceByDay {
  timestamp: Date;
  averagePrice: number;
}

export interface ChartData {
  time: Date;
  low: number;
  high: number;
  open: number;
}
interface OHLCData {
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

const postLimitedResellSchema = z.object({
  price: z.number().min(1),
});
const patchItemEditSchema = z
  .object({
    name: z.string().min(1).max(64).optional(),
    description: z.string().min(1).max(128).optional(),
    price: z.number().optional(),
    previewUri: z.string().optional(),
    onSale: z.boolean().optional(),
  })
  .strict();

function transformToOHLCData(
  receipts: LimitedCatalogItemReceipt[]
): OHLCData[] {
  const ohlcData: OHLCData[] = [];

  const dateToOHLCMap: { [date: string]: OHLCData } = {};

  for (const receipt of receipts) {
    const dateStr = receipt.createdAt.toISOString().substr(0, 10);

    if (!dateToOHLCMap[dateStr]) {
      dateToOHLCMap[dateStr] = {
        time: new Date(dateStr),
        open: receipt.salePrice,
        high: receipt.salePrice,
        low: receipt.salePrice,
        close: receipt.salePrice,
      };
    } else {
      const data = dateToOHLCMap[dateStr];
      data.high = Math.max(data.high, receipt.salePrice);
      data.low = Math.min(data.low, receipt.salePrice);
      data.close = receipt.salePrice;
    }
  }

  ohlcData.push(...Object.values(dateToOHLCMap));

  return ohlcData;
}

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
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const receipts = await prisma.limitedCatalogItemReceipt.findMany({
        where: {
          itemId: id,
          createdAt: {
            gte: threeMonthsAgo,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const chartData = transformToOHLCData(receipts);

      return <GetChartDataResponse>{
        success: true,
        data: {
          data: chartData,
        },
      };
    } catch (error) {
      return <IResponseBase>{
        success: false,
        message: "Internal server error",
      };
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
    @Query("type") type?: "limited" | "limited-resell" | "normal",
    @Query("genericType") genericType?: AssetType
  ) {
    price = Number(price);

    if (!price && !genericType) {
      return <IResponseBase>{
        success: false,
        message: "No price provided",
      };
    }

    if (genericType) {
      if (genericType === "limited-catalog-item") {
        return <IResponseBase>{
          success: false,
          message:
            "genericType does not handle limited items - only generic items that extend generic asset types",
        };
      }
      if (!prismaAssetTypeMap[genericType]) {
        return <IResponseBase>{
          success: false,
          message: "Invalid type provided",
        };
      }

      const queryExecutor = prisma[
        prismaAssetTypeMap[genericType]
      ] as never as {
        findFirst: (
          args: Prisma.CatalogItemFindFirstArgs
        ) => Promise<CatalogItem & { apartOf: Inventory[] }>;
        update: (
          args: Prisma.CatalogItemUpdateArgs
        ) => Promise<CatalogItem & { apartOf: Inventory[] }>;
      };

      const item = (await queryExecutor.findFirst({
        where: {
          id,
        },
        include: {
          apartOf: {
            where: {
              userId: user.id,
            },
          },
          author: {
            select: {
              username: true,
            },
          },
        },
      })) as CatalogItem & {
        author: { username: string };
        apartOf: Inventory[];
      };

      if (!item) {
        return <IResponseBase>{
          success: false,
          message: "No item found with this id",
        };
      }

      if (item.apartOf.length > 0) {
        return <IResponseBase>{
          success: false,
          message: "You already own this item",
        };
      }

      if (item.price > user.tickets) {
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

      const inventoryConnector = prismaInventoryMapping[genericType];

      await prisma.inventory.update({
        where: {
          userId: user.id,
        },
        data: {
          [inventoryConnector as keyof Inventory]: {
            connect: {
              id: id,
            },
          },
        },
      });
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          tickets: {
            decrement: item.price,
          },
          transactions: {
            create: {
              type: TransactionType.OUTBOUND,
              to: {
                connect: {
                  id: item.authorId,
                },
              },
              tickets: item.price,
              description: `Bought ${item.name} from ${item.author.username}`,
            },
          },
        },
      });
      await prisma.user.update({
        where: {
          id: item.authorId,
        },
        data: {
          tickets: {
            increment: item.price,
          },
          transactions: {
            create: {
              type: TransactionType.INBOUND,
              from: {
                connect: {
                  id: user.id,
                },
              },
              to: {
                connect: {
                  id: item.authorId,
                },
              },
              tickets: item.price,
              description: `Sold ${item.name} to ${user.username}`,
            },
          },
        },
      });

      return <IResponseBase>{
        success: true,
      };
    } else {
      if (type === "limited") {
        const limited = await prisma.limitedCatalogItem.findFirst({
          where: {
            id,
            onSale: true,
          },
          include: {
            author: {
              select: {
                username: true,
              },
            },
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
            message:
              "This item is out of stock - you need to buy from resellers",
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
        await prisma.user.update({
          where: {
            id: limited.authorId,
          },
          data: {
            tickets: {
              increment: price,
            },
            transactions: {
              create: {
                type: TransactionType.INBOUND,
                from: {
                  connect: {
                    id: user.id,
                  },
                },
                to: {
                  connect: {
                    id: limited.authorId,
                  },
                },
                tickets: price,
                description: `Sold ${limited.name} to ${user.username}`,
              },
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
            transactions: {
              create: {
                type: TransactionType.OUTBOUND,
                to: {
                  connect: {
                    id: limited.authorId,
                  },
                },
                tickets: price,
                description: `Bought ${limited.name} from ${limited.author.username}`,
              },
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
          include: {
            item: true,
            seller: {
              select: {
                username: true,
              },
            },
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
            notifications: {
              create: {
                type: NotificationType.SUCCESS,
                title: "Your item has been sold",
                message: `Your item, ${resell.item.name} (serial: ${
                  resell.id.split("-")[0]
                }), has been sold for ${price}T$ to @${user.username}!`,
              },
            },
            transactions: {
              create: {
                type: TransactionType.INBOUND,
                from: {
                  connect: {
                    id: user.id,
                  },
                },
                to: {
                  connect: {
                    id: resell.sellerId,
                  },
                },
                tickets: price,
                description: `Sold ${resell.item.name} to @${
                  user.username
                } with serial ${resell.id.split("-")[0]}`,
              },
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
            transactions: {
              create: {
                type: TransactionType.OUTBOUND,
                to: {
                  connect: {
                    id: resell.sellerId,
                  },
                },
                tickets: price,
                description: `Bought ${resell.item.name} from @${
                  resell.seller.username
                } with serial ${resell.id.split("-")[0]}`,
              },
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
    }

    return <IResponseBase>{
      success: true,
    };
  }

  @Patch("/sku/:id/edit")
  @Authorized()
  public async patchItemEdit(
    @Param("id") id: string,
    @Account() user: User,
    @Body() body: unknown,
    @Query("type") type: AssetType
  ) {
    if (!type || !prismaAssetTypeMap[type]) {
      return <IResponseBase>{
        success: false,
        message: "Invalid type provided",
      };
    }

    const queryExecutor = prisma[prismaAssetTypeMap[type]] as never as {
      findFirst: (
        args: Prisma.CatalogItemFindFirstArgs
      ) => Promise<CatalogItem & { apartOf: Inventory[] }>;
      update: (
        args: Prisma.CatalogItemUpdateArgs
      ) => Promise<CatalogItem & { apartOf: Inventory[] }>;
    };

    const item = (await queryExecutor.findFirst({
      where: {
        id,
        canAuthorEdit: true,
        author: {
          id: user.id,
        },
      },
    })) as CatalogItem;

    if (!item) {
      return <IResponseBase>{
        success: false,
        message: "No item found with this id that can be edited by you",
      };
    }

    const data = patchItemEditSchema.parse(body);

    await queryExecutor.update({
      where: {
        id,
      },
      data: {
        ...data,
        ...(data.price
          ? {
              priceBits: data.price * 10,
            }
          : {}),
      },
    });

    return <IResponseBase>{
      success: true,
    };
  }

  @Get("/sku/:id/ownership-status")
  @Authorized()
  public async getCatalogItemOwnershipStatus(
    @Param("id") id: string,
    @Account() user: User,
    @Query("type") type?: AssetType
  ) {
    if (!type || !prismaAssetTypeMap[type]) {
      return <IResponseBase>{
        success: false,
        message: "No type provided - or provided type is invalid",
      };
    }

    if (type === "limited-catalog-item") {
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
    } else {
      const queryExecutor = prisma[prismaAssetTypeMap[type]] as never as {
        findFirst: (args: Prisma.CatalogItemFindFirstArgs) => Promise<any>;
      };

      const catalogItem = await queryExecutor.findFirst({
        where: {
          id,
        },
        include: {
          apartOf: {
            where: {
              userId: user.id,
            },
          },
        },
      });

      if (!catalogItem) {
        return <GetCatalogItemOwnershipStatusResponse>{
          success: false,
          message: "No catalog item found with this id",
        };
      }

      return <GetCatalogItemOwnershipStatusResponse>{
        success: true,
        data: {
          owned: catalogItem.apartOf.length > 0,
        },
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

  @Patch("/sku/:id/stargaze")
  @Authorized()
  public async patchLimitedStargaze(
    @Param("id") id: string,
    @Account() user: User,
    @Query("type") type: AssetType
  ) {
    if (!type || !prismaAssetTypeMap[type]) {
      return <IResponseBase>{
        success: false,
        message: "No type provided - or provided type is invalid",
      };
    }

    const queryExecutor = prisma[prismaAssetTypeMap[type]] as never as {
      findFirst: (args: Prisma.CatalogItemFindFirstArgs) => Promise<any>;
      update: (args: Prisma.CatalogItemUpdateArgs) => Promise<any>;
    };

    const catalogItem = await queryExecutor.findFirst({
      where: {
        id,
      },
      include: {
        stargazers: {
          where: {
            id: user.id,
          },
        },
      },
    });

    if (!catalogItem) {
      return <IResponseBase>{
        success: false,
        message: "No catalog item found with this id",
      };
    }

    await queryExecutor.update({
      where: {
        id,
      },
      data: {
        stargazers: {
          [catalogItem.stargazers.length > 0 ? "disconnect" : "connect"]: {
            id: user.id,
          },
        },
      },
    });

    return <IResponseBase>{
      success: true,
    };
  }

  @Get("/sku/:id/stargaze-status")
  @Authorized()
  public async getAssetStargazingStatus(
    @Param("id") id: string,
    @Account() user: User,
    @Query("type") type: AssetType
  ) {
    if (!type || !prismaAssetTypeMap[type]) {
      return <GetAssetStargazingStatusResponse>{
        success: false,
        message: "No type provided - or provided type is invalid",
      };
    }

    const queryExecutor = prisma[prismaAssetTypeMap[type]] as never as {
      findFirst: (args: Prisma.CatalogItemFindFirstArgs) => Promise<any>;
    };

    const catalogItem = await queryExecutor.findFirst({
      where: {
        id,
      },
      include: {
        stargazers: {
          where: {
            id: user.id,
          },
        },
      },
    });

    if (!catalogItem) {
      return <GetAssetStargazingStatusResponse>{
        success: false,
        message: "No catalog item found with this id",
      };
    }

    return <GetAssetStargazingStatusResponse>{
      success: true,
      data: {
        stargazing: catalogItem.stargazers.length > 0,
      },
    };
  }

  @Get("/browse")
  @Authorized()
  public async getCatalogBrowseAssets(
    @Query("type") type: AssetItemType,
    @Query("include_limiteds") includeLimiteds: boolean,
    @Query("search") search: string,
    @Query("page") page: number
  ) {
    if (!type)
      return <GetCatalogBrowseAssetsResponse>{
        success: false,
        message: "No type provided",
      };

    includeLimiteds = Boolean(String(includeLimiteds).toLowerCase() === "true");

    const queryExecutor = prisma[
      prismaAssetItemTypeModelMap[type]
    ] as never as {
      findMany: (
        args: Prisma.CatalogItemFindFirstArgs
      ) => Promise<AssetFrontend[]>;
    };
    const hasType = assetItemTypeWithTypeProp.includes(type);

    const generic = await queryExecutor.findMany({
      where: {
        ...(hasType ? { type: type.toUpperCase() as CatalogItemType } : {}),
        ...(search
          ? {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
      },
      skip: (page - 1) * 40,
      take: 40,
    });
    const limited =
      includeLimiteds && prismaAssetItemTypeViewMap[type] === "catalog-item"
        ? await prisma.limitedCatalogItem.findMany({
            where: {
              type: type.toUpperCase() as CatalogItemType,
              ...(search
                ? {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  }
                : {}),
            },
            skip: (page - 1) * 40,
            take: 40,
          })
        : [];

    const result = [...generic, ...limited].sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name === b.name) return 0;
      return 1;
    });

    return <GetCatalogBrowseAssetsResponse>{
      success: true,
      data: {
        assets: result,
      },
    };
  }

  @Delete("/sku/:id/delete")
  @Authorized()
  public async deleteSku(
    @Account() user: User,
    @Param("id") id: string,
    @Query("type") type?: AssetType
  ) {
    if (!type || !prismaAssetTypeMap[type]) {
      return <IResponseBase>{
        success: false,
        message: "No type provided - or provided type is invalid",
      };
    }

    if (type === "limited-catalog-item") {
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

      if (!owned)
        return <IResponseBase>{
          success: false,
          message: "No such item exists.",
        };

      if (owned?.count > 1) {
        await prisma.limitedInventoryItem.update({
          where: {
            id: owned.id,
          },
          data: {
            count: {
              decrement: 1,
            },
          },
        });
      } else {
        await prisma.limitedInventoryItem.delete({
          where: {
            id: owned.id,
          },
        });
      }
    } else {
      const queryExecutor = prisma[prismaAssetTypeMap[type]] as never as {
        findFirst: (args: Prisma.CatalogItemFindFirstArgs) => Promise<any>;
        update: (args: Prisma.CatalogItemUpdateArgs) => Promise<any>;
      };

      const catalogItem = await queryExecutor.findFirst({
        where: {
          id,
        },
        include: {
          apartOf: {
            where: {
              userId: user.id,
            },
          },
        },
      });

      if (!catalogItem) {
        return <GetCatalogItemOwnershipStatusResponse>{
          success: false,
          message: "No catalog item found with this id",
        };
      }

      await queryExecutor.update({
        where: {
          id,
        },
        data: {
          apartOf: {
            disconnect: {
              userId: user.id,
            },
          },
        },
      });
    }

    return <IResponseBase>{
      success: true,
    };
  }
}

export default createHandler(CatalogRouter);
