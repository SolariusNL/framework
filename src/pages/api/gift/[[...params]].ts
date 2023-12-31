import Authorized, { Account } from "@/util/api/authorized";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import { GiftCodeGrant } from "@prisma/client";
import { createHandler, Param, Post } from "@solariusnl/next-api-decorators";

class GiftRouter {
  @Post("/redeem/:code")
  @Authorized()
  public async redeemGift(@Param("code") code: string, @Account() user: User) {
    if (!code) {
      return {
        success: false,
        message: "No code provided",
      };
    }

    const gift = await prisma.giftCode.findFirst({
      where: {
        code: String(code),
      },
    });

    if (!gift || gift.redeemed) {
      return {
        success: false,
        message: "Invalid code",
      };
    }

    await prisma.giftCode.update({
      where: {
        id: gift.id,
      },
      data: {
        redeemed: true,
        redeemedBy: {
          connect: {
            id: Number(user.id),
          },
        },
        redeemedAt: new Date(),
      },
    });

    switch (gift.grant) {
      case GiftCodeGrant.FIVETHOUSAND_TICKETS:
        await prisma.user.update({
          where: {
            id: Number(user.id),
          },
          data: {
            tickets: {
              increment: 5000,
            },
          },
        });
        break;
      case GiftCodeGrant.PREMIUM_ONE_MONTH:
        return {
          success: false,
          message: "Stripe now handles premium subscriptions.",
        };
      case GiftCodeGrant.PREMIUM_ONE_YEAR:
        return {
          success: false,
          message: "Stripe now handles premium subscriptions.",
        };
      case GiftCodeGrant.PREMIUM_SIX_MONTHS:
        return {
          success: false,
          message: "Stripe now handles premium subscriptions.",
        };
      case GiftCodeGrant.SIXTEENTHOUSAND_TICKETS:
        await prisma.user.update({
          where: {
            id: Number(user.id),
          },
          data: {
            tickets: {
              increment: 16000,
            },
          },
        });
        break;
      case GiftCodeGrant.THOUSAND_TICKETS:
        await prisma.user.update({
          where: {
            id: Number(user.id),
          },
          data: {
            tickets: {
              increment: 1000,
            },
          },
        });
        break;
      case GiftCodeGrant.TWOTHOUSAND_TICKETS:
        await prisma.user.update({
          where: {
            id: Number(user.id),
          },
          data: {
            tickets: {
              increment: 2000,
            },
          },
        });
        break;
    }

    return {
      success: true,
      message: "Gift redeemed",
      reward: gift.grant,
    };
  }

  @Post("/randomPrize")
  @Authorized()
  public async randomPrize(@Account() user: User) {
    if (user.lastRandomPrize == undefined) {
      await prisma.user.update({
        where: {
          id: Number(user.id),
        },
        data: {
          lastRandomPrize: new Date(0),
        },
      });
    }

    if (
      new Date(user.lastRandomPrize!).getTime() >
      Date.now() - 24 * 60 * 60 * 1000
    ) {
      return {
        success: false,
        message:
          "You've already redeemed your prize today. Come back tomorrow!",
      };
    }

    let possible = [
      30, 40, 50, 60, 70, 75, 80, 100, 110, 120, 130, 140, 150, 200, 210, 215,
      220, 225, 300,
    ];
    if (user.premium) possible = [...possible, 1500, 2500];
    const random = possible[Math.floor(Math.random() * possible.length)];

    await prisma.user.update({
      where: {
        id: Number(user.id),
      },
      data: {
        lastRandomPrize: new Date(),
        bits: {
          increment: random,
        },
      },
    });

    return {
      success: true,
      earned: random,
    };
  }
}

export default createHandler(GiftRouter);
