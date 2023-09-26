import { NotificationType } from "@prisma/client";
import { FwCronJob } from "../classes";
import prisma from "../prisma";

const serverSync = new FwCronJob("0 * * * *", "server-sync", async () => {
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

export default serverSync;