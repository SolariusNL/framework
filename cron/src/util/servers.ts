import { Connection, NotificationType, User } from "@prisma/client";
import axios from "axios";
import prisma from "../prisma";

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

async function setServerStatus(server: Connection, online: boolean) {
  await prisma.connection.update({
    where: {
      id: server.id,
    },
    data: {
      online,
    },
  });
}

export default setServerStatus;
