import { Connection } from "@prisma/client";
import prisma from "../prisma";

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
