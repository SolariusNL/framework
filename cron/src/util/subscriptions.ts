import { client } from "../app";
import { scheduleJob } from "node-schedule";
import {
  NotificationType,
  PremiumSubscriptionType,
  Prisma,
} from "@prisma/client";
import { schedule } from "node-cron";

const user = Prisma.validator<Prisma.UserArgs>()({
  include: {
    premiumSubscription: true,
  },
});

type User = Prisma.UserGetPayload<typeof user>;

async function schedulePremiumExpiration(user: User) {
  if (!user.premiumSubscription) {
    return;
  }

  const subscription = user.premiumSubscription;

  async function invalidate() {
    await client.user.update({
      where: {
        id: user.id,
      },
      data: {
        premium: false,
        premiumSubscription: {
          delete: true,
        },
        notifications: {
          create: {
            title: "Subscription expired",
            message:
              "Your Framework Premium subscription has expired. You will no longer receive premium benefits. You can renew your subscription at any time.",
            type: NotificationType.ALERT,
          },
        },
      },
    });

    console.log(
      `cron->premiumservice ~ ✅ Subscription expired for user ${user.id}`
    );
  }

  if (subscription.expiresAt < new Date()) {
    await invalidate();
    return;
  }

  scheduleJob(subscription.expiresAt, async () => {
    await invalidate();
  });
}

async function grantPremiumMonthlyReward(user: User) {
  async function grantTickets(amt: number) {
    await client.user.update({
      where: {
        id: user.id,
      },
      data: {
        tickets: {
          increment: amt,
        },
        premiumSubscription: {
          update: {
            lastReward: new Date(),
          },
        },
        notifications: {
          create: {
            title: "Premium monthly reward",
            message: `You have received ${amt} tickets for being a Framework Premium member. Thank you for your support!`,
            type: NotificationType.SUCCESS,
          },
        },
      },
    });
  }

  const level = user.premiumSubscription?.type;

  if (
    new Date().getTime() - user.premiumSubscription!.lastReward.getTime() >
    1000 * 60 * 60 * 24 * 30
  ) {
    switch (level) {
      case PremiumSubscriptionType.PREMIUM_ONE_MONTH:
        await grantTickets(1200);
        break;
      case PremiumSubscriptionType.PREMIUM_ONE_YEAR:
        await grantTickets(14400);
        break;
      case PremiumSubscriptionType.PREMIUM_SIX_MONTHS:
        await grantTickets(7200);
        break;
    }
  }
}

async function startSubscriptionService() {
  const initial = await client.user.findMany({
    where: {
      premium: true,
      premiumSubscription: {
        isNot: null,
      },
    },
    include: {
      premiumSubscription: true,
    },
  });

  for (const user of initial) {
    schedulePremiumExpiration(user);
    grantPremiumMonthlyReward(user);
  }

  schedule("0 9 * * *", async () => {
    const users = await client.user.findMany({
      where: {
        premium: true,
        premiumSubscription: {
          isNot: null,
        },
      },
      include: {
        premiumSubscription: true,
      },
    });

    for (const user of users) {
      schedulePremiumExpiration(user);
      grantPremiumMonthlyReward(user);
    }

    console.log("cron->premiumservice ~ 🔃 Subscription service ran");
  });
}

export default startSubscriptionService;
