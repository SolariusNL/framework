import { GiftCodeGrant } from "@prisma/client";
import { createHandler, Param, Post } from "@storyofams/next-api-decorators";
import Authorized, { Account } from "../../../util/api/authorized";
import generateGiftCode from "../../../util/generateGiftCode";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";
import { grantInformation } from "../../redeem";

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
        if (user.premium) {
          return {
            success: false,
            message: "User already has premium",
          };
        }

        await prisma.user.update({
          where: {
            id: Number(user.id),
          },
          data: {
            premium: true,
            premiumSubscription: {
              create: {
                type: "PREMIUM_ONE_MONTH",
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
        });
        break;
      case GiftCodeGrant.PREMIUM_ONE_YEAR:
        if (user.premium) {
          return {
            success: false,
            message: "User already has premium",
          };
        }

        await prisma.user.update({
          where: {
            id: Number(user.id),
          },
          data: {
            premium: true,
            premiumSubscription: {
              create: {
                type: "PREMIUM_ONE_YEAR",
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              },
            },
          },
        });
        break;
      case GiftCodeGrant.PREMIUM_SIX_MONTHS:
        if (user.premium) {
          return {
            success: false,
            message: "User already has premium",
          };
        }

        await prisma.user.update({
          where: {
            id: Number(user.id),
          },
          data: {
            premium: true,
            premiumSubscription: {
              create: {
                type: "PREMIUM_SIX_MONTHS",
                expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
              },
            },
          },
        });
        break;
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

    const prizes: GiftCodeGrant[] = [
      GiftCodeGrant.PREMIUM_ONE_MONTH,
      GiftCodeGrant.THOUSAND_TICKETS,
      GiftCodeGrant.TWOTHOUSAND_TICKETS,
    ];

    await prisma.user.update({
      where: {
        id: Number(user.id),
      },
      data: {
        lastRandomPrize: new Date(),
      },
    });

    const prize = prizes[Math.floor(Math.random() * prizes.length)];

    const code = await prisma.giftCode.create({
      data: {
        grant: prize,
        code: String(generateGiftCode()),
        redeemedAt: new Date(0),
      },
    });

    return {
      success: true,
      message: grantInformation[prize].message,
      code: code.code,
    };
  }
}

export default createHandler(GiftRouter);
