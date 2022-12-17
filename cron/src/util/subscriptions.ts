import { client } from "../app";
import { scheduleJob } from "node-schedule";
import { PremiumSubscriptionType, Prisma } from "@prisma/client";
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
      },
    });
  }

  const level = user.premiumSubscription?.type;

  if (
    new Date(user.premiumSubscription!.lastReward) <
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ) {
    switch (level) {
      case PremiumSubscriptionType.PREMIUM_ONE_MONTH:
        //await grantTickets(1200);
        break;
      case PremiumSubscriptionType.PREMIUM_ONE_YEAR:
        //await grantTickets(14400);
        break;
      case PremiumSubscriptionType.PREMIUM_SIX_MONTHS:
        //await grantTickets(7200);
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
