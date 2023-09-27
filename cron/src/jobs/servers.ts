import { FwCronJob } from "../classes";
import prisma from "../prisma";
import { cron } from "../schedules";
import { checkServerStatus } from "../util/servers";

const serverJob = new FwCronJob(
  cron.hours.everySixHours,
  "server-sync",
  async () => {
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
  }
);

export default serverJob;
