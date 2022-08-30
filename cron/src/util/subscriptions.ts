import { client } from "../app";
import { scheduleJob } from "node-schedule";
import { Prisma } from "@prisma/client";
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

async function startSubscriptionService() {
  schedule("0 */3 * * *", async () => {
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
    }

    console.log("cron->premiumservice ~ 🔃 Subscription service refreshed");
  });
}

export default startSubscriptionService;
