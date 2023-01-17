import { NotificationType } from "@prisma/client";
import {
  BadRequestException,
  Body,
  createHandler,
  Post,
  UnauthorizedException,
} from "@storyofams/next-api-decorators";
import Authorized, { Account } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";

class ReferralsRouter {
  @Post("/create")
  @Authorized()
  public async createReferral(@Account() user: User) {
    if (user.referralId) {
      throw new BadRequestException("You already have a referral link");
    }

    const eightDigitCode = Math.floor(Math.random() * 100000000);

    const referral = await prisma.referral.create({
      data: {
        code: eightDigitCode,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return {
      code: referral.code,
    };
  }

  @Post("/enter")
  @Authorized()
  public async enterReferral(
    @Account() user: User,
    @Body() { code }: { code: number }
  ) {
    if (!code) throw new BadRequestException("No code provided");

    if (
      // must be less than a month old
      new Date().getTime() - new Date(user.createdAt).getTime() <
      1000 * 60 * 60 * 24 * 30
    ) {
      throw new BadRequestException(
        "Your account must be at least a month old to use a referral code"
      );
    }

    const referral = await prisma.referral.findUnique({
      where: {
        code,
      },
      include: {
        user: true,
      },
    });

    if (!referral) {
      throw new BadRequestException("Invalid referral code");
    }

    if (referral?.userId === user.id) {
      throw new UnauthorizedException("You can't enter your own referral code");
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        usedReferral: {
          connect: {
            id: referral.id,
          },
        },
        tickets: {
          increment: 150,
        },
      },
    });
    await prisma.user.update({
      where: {
        id: referral.userId!,
      },
      data: {
        tickets: {
          increment: 150,
        },
        notifications: {
          create: {
            type: NotificationType.SUCCESS,
            title: "Referral used",
            message: `${user.username} used your referral code! You both got 150 tickets. Thanks for spreading the word!`,
          },
        },
      },
    });

    return {
      success: true,
    };
  }
}

export default createHandler(ReferralsRouter);
