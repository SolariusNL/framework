import { client } from "../app";
import { scheduleJob } from "node-schedule";

async function startSubscriptionService() {
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
    if (!user.premiumSubscription) {
      continue;
    }

    const subscription = user.premiumSubscription;

    scheduleJob(subscription.expiresAt, async () => {
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
    });
  }
}

export default startSubscriptionService;
