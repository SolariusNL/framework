import { Connection } from "@prisma/client";
import { client } from "../app";

async function setServerStatus(server: Connection, online: boolean) {
  await client.connection.update({
    where: {
      id: server.id,
    },
    data: {
      online,
    },
  });
}

export default setServerStatus;
