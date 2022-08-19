import { schedule } from "node-cron";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import axios from "axios";
import setServerStatus from "./util/servers";

export const client = new PrismaClient();
config({
  path: "../.env",
});

async function cron() {
  await client
    .$connect()
    .then(() => {
      console.log("cron ~ ✅ Connected to Prisma");
      schedule("0 * * * *", async () => {
        const servers = await client.connection.findMany({
          where: {
            online: true,
          },
        });

        for (const server of servers) {
          const response = await axios
            .get(`http://${server.ip}:${server.port}/api/server`)
            .then((res) => res.data)
            .catch(async () => {
              console.log(
                `cron ~ ❌ Server ${server.id} (${server.ip}:${server.port}) is offline, couldn't reach it.`
              );
              await setServerStatus(server, false);
            });

          if (!response.sync) {
            await setServerStatus(server, false);
            console.log(
              `cron ~ ❌ Server ${server.id} (${server.ip}:${server.port}) is not synced with Soodam.re; status updated`
            );
          } else {
            console.log(
              `cron ~ ✅ Server ${server.id} (${server.ip}:${server.port}) is online`
            );
          }
        }

        console.log("cron ~ 🔄 Server status synchronization complete");
      });
    })
    .catch((e: unknown) => {
      console.log(`Failed to connect to Framework database: ${e}`);
    });
}

cron();
