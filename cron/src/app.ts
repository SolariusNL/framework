import { Connection, NotificationType, User } from "@prisma/client";
import axios from "axios";
import { schedule } from "node-cron";
import prisma from "./prisma";
import setServerStatus from "./util/servers";
import { FwCronClient } from "./classes";
import giveawayJob from "./jobs/giveaways";

async function cron() {
  try {
    console.log("cron ~ ✅ Connected to Prisma");

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

const client = new FwCronClient().register(giveawayJob, true);
client.start();