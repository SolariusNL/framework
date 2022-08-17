import { schedule } from "node-cron";
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

const client = new PrismaClient();
config({
  path: "../.env",
});

async function cron() {
  await client.$connect()
    .then(() => {
      schedule("*/5 * * * * *", async () => {
        // do something every 5 seconds
      });
    })
    .catch((e) => {
      console.log(`Failed to connect to Framework database: ${e}`);
    });
}

cron();