import { schedule } from "node-cron";
import { Connection, PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import axios from "axios";
import setServerStatus from "./util/servers";
import startSubscriptionService from "./util/subscriptions";

export const client = new PrismaClient();
config({ path: "../.env" });

async function checkServerStatus(server: Connection) {
  try {
    const response = await axios.get(
      `http://${server.ip}:${server.port}/api/server`
    );
    if (!response.data.sync) {
      await setServerStatus(server, false);
      console.log(
        `cron ~ ❌ Server ${server.id} (${server.ip}:${server.port}) is not synced with Soodam.re; status updated`
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
  }
}

async function cron() {
  try {
    await client.$connect();
    console.log("cron ~ ✅ Connected to Prisma");
    console.log("cron ~ 🔃 Starting subscription service");
    startSubscriptionService();

    schedule("0 * * * *", async () => {
      const servers = await client.connection.findMany({
        where: { online: true },
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
