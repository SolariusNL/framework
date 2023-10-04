import cast from "@/util/cast";
import logger from "@/util/logger";
import { Redis, RedisOptions } from "ioredis";

const features = [
  {
    name: "API Cache",
    description:
      "Cache API responses in Redis to reduce load on the database. This will not be enabled.",
  },
  {
    name: "Rate Limiting",
    description:
      "Rate limit API requests to prevent abuse. This will fall back to an in-memory store wherever possible.",
  },
];

export const createRedisClient = () => {
  try {
    const connUrl = process.env.REDIS_URL;
    if (!connUrl) {
      logger().warn(
        "Redis will not be used, following features will be disabled:"
      );
      features.forEach((feature) =>
        logger().warn(`\t- ${feature.name}: ${feature.description}`)
      );
    }

    const { hostname: host, port, password } = new URL(connUrl!);

    const options: RedisOptions = {
      host: host,
      lazyConnect: true,
      showFriendlyErrorStack: true,
      enableAutoPipelining: true,
      maxRetriesPerRequest: 0,
      retryStrategy: (times: number) => {
        if (times > 3) {
          logger().error(
            "Redis connection failed after 3 retries. Redis will not be used, and the following features will be disabled:"
          );
          features.forEach((feature) =>
            logger().error(`\t- ${feature.name}: ${feature.description}`)
          );
          return;
        }
        return Math.min(times * 200, 1000);
      },
      password: password,
      port: parseInt(port),
    };

    const redis = new Redis(options);

    redis.on("error", (error: unknown) => {
      logger().error(`Redis error: ${error} (server: ${connUrl})`);
    });

    return redis;
  } catch (error) {
    logger().error(
      `Redis error: ${cast<Error>(error).message || "Unknown error."}`
    );
  }
};

export default createRedisClient();
