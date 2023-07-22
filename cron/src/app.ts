import { Connection, NotificationType, User } from "@prisma/client";
import axios from "axios";
import { schedule } from "node-cron";
import prisma from "./prisma";
import setServerStatus from "./util/servers";

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
    schedule("0 0 * * *", async () => await processGiveaways());
    await processGiveaways();
  } catch (error) {
    console.log(`Failed to connect to Framework database: ${error}`);
  }
}

async function processGiveaways() {
  const giveaways = await prisma.teamGiveaway.findMany({
    where: {
      AND: [{ ended: false }, { endsAt: { lte: new Date() } }],
    },
    include: {
      participants: {
        select: {
          id: true,
        },
      },
    },
  });
  console.log(
    `cron ~ 🎉 ${giveaways.length} giveaway${
      giveaways.length === 1 ? "" : "s"
    } ended`
  );

  for (const giveaway of giveaways) {
    const participants = await prisma.user.findMany({
      where: {
        id: {
          in: giveaway.participants.map((p) => p.id),
        },
      },
    });

    if (participants.length === 0) {
      await prisma.teamGiveaway.update({
        where: {
          id: giveaway.id,
        },
        data: {
          ended: true,
          tickets: {
            increment: giveaway.tickets,
          },
        },
      });

      const staff = await prisma.user.findMany({
        where: {
          staffOf: {
            some: {
              id: giveaway.teamId,
            },
          },
          ownedTeams: {
            some: {
              id: giveaway.teamId,
            },
          },
        },
      });

      for (const user of staff) {
        await prisma.notification.create({
          data: {
            type: NotificationType.ALERT,
            title: "Giveaway ended",
            message: `Giveaway ${giveaway.name} ended without any participants. Tickets were refunded to the team.`,
            userId: user.id,
          },
        });
      }

      continue;
    }

    const winner =
      participants[Math.floor(Math.random() * participants.length)];

    await prisma.teamGiveaway.update({
      where: {
        id: giveaway.id,
      },
      data: {
        ended: true,
      },
    });
    await prisma.user.update({
      where: {
        id: winner.id,
      },
      data: {
        tickets: {
          increment: giveaway.tickets,
        },
      },
    });
    await prisma.notification.create({
      data: {
        type: NotificationType.GIFT,
        title: "You won a giveaway!",
        message: `You won ${giveaway.name} and received T$${giveaway.tickets}!`,
        user: {
          connect: {
            id: winner.id,
          },
        },
      },
    });
  }
}

cron();
