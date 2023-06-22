import { Connection, NotificationType, User } from "@prisma/client";
import axios from "axios";
import { schedule } from "node-cron";
import prisma from "./prisma";
import setServerStatus from "./util/servers";
import startSubscriptionService from "./util/subscriptions";

type ConnectionWithGameAndAuthor = Connection & {
  game: {
    author: User;
  };
};

async function checkServerStatus(server: ConnectionWithGameAndAuthor) {
  try {
    const response = await axios.get(
      `http://${server.ip}:${server.port}/api/server`
    );
    if (!response.data.sync) {
      await setServerStatus(server, false);
      console.log(
        `cron ~ ❌ Server ${server.id} (${server.ip}:${server.port}) is not synced with Solarius; status updated`
      );
    } else {
      console.log(
        `cron ~ ✅ Server ${server.id} (${server.ip}:${server.port}) is online`
      );
    }
  } catch (error) {
    console.log(
      `cron ~ ❌ Server ${server.id} (${server.ip}:${server.port}) is offline, couldn't reach it.`
    );
    await setServerStatus(server, false);
    await prisma.notification.create({
      data: {
        type: NotificationType.ALERT,
        title: "Server offline",
        message: `Server ${server.ip}:${server.port} couldn't be reached and was marked as offline.`,
        userId: server.game.author.id,
      },
    });
  }
}

async function cron() {
  try {
    console.log("cron ~ ✅ Connected to Prisma");
    console.log("cron ~ 🔃 Starting subscription service");
    startSubscriptionService();

    schedule("0 * * * *", async () => {
      const servers = await prisma.connection.findMany({
        where: { online: true },
        include: {
          game: {
            include: {
              author: true,
            },
          },
        },
      });

      for (const server of servers) {
        await checkServerStatus(server);
      }

      console.log("cron ~ 🔄 Server status synchronization complete");
    });
  } catch (error) {
    console.log(`Failed to connect to Framework database: ${error}`);
  }
}

cron();
