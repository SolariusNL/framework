import logger from "@/util/logger";
import { Badge, Role } from "@prisma/client";
import Queue from "bull";
import cast from "./cast";
import { Fwx } from "./fwx";
import prisma from "./prisma";

export const badgeQueue =
  process.env.REDIS_URL && process.env.REDIS_URL !== "redis://CHANGE_ME:6379"
    ? new Queue("badge-sync", String(process.env.REDIS_URL))
    : null;
const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
const PREALPHA_END = new Date("2023-12-27T00:00:00.000Z");

const syncBadges = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return;
  }

  if (
    new Date(user.createdAt).getTime() < Date.now() - ONE_YEAR &&
    !user.badges.includes(Badge.VETERAN)
  )
    await Fwx.Badges.grant(Badge.VETERAN, user.id);
  if (
    new Date(user.createdAt).getTime() < PREALPHA_END.getTime() &&
    !user.badges.includes(Badge.PRE_ALPHA)
  )
    await Fwx.Badges.grant(Badge.PRE_ALPHA, user.id);

  /**
   * @todo when we add functionality to change role, remove this
   */
  if (user.role === Role.ADMIN && !user.badges.includes(Badge.STAFF))
    await Fwx.Badges.grant(Badge.STAFF, user.id);
  else if (user.badges.includes(Badge.STAFF) && user.role !== Role.ADMIN)
    await Fwx.Badges.revoke(Badge.STAFF, user.id);

  if (user.tickets > 1_000_000 && !user.badges.includes(Badge.TYCOON))
    await Fwx.Badges.grant(Badge.TYCOON, user.id);
  else if (user.tickets < 1_000_000 && user.badges.includes(Badge.TYCOON))
    await Fwx.Badges.revoke(Badge.TYCOON, user.id);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      lastBadgeSync: new Date(),
    },
  });
};

export const queueBadgeSync = async (userId: number) => {
  if (!badgeQueue) {
    logger().warn(
      "It is recommended to use a Redis queue for badge syncing to prevent clogging up the Framework server thread. Since no Redis URL is provided, badge syncing will be done synchronously."
    );
    await syncBadges(userId);
  } else {
    badgeQueue.add(
      { userId },
      {
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: true,
        jobId: `badge:${userId.toString()}`,
      }
    );
    logger().info(`Badge sync queued for user ${userId}`);
  }
};

if (badgeQueue) {
  badgeQueue.isReady().then(() => {
    logger().info(
      `Badge sync queue connected to Redis at ${process.env.REDIS_URL}`
    );
  });

  badgeQueue.process(async (job, done) => {
    try {
      await syncBadges(job.data.userId);
      done();
    } catch (err) {
      logger().error(
        `Fail to send mail to ${job.data.to} with error: ${
          cast<Error>(err).message
        }`
      );
    }
  });
}
