import { TeamAuditLogType } from "@prisma/client";
import logger from "./logger";
import prisma from "./prisma";

namespace Teams {
  export async function createAuditLog(
    type: TeamAuditLogType,
    pairs: Array<{ key: string; value: string }>,
    content: string,
    uid: number,
    tid: string
  ) {
    await prisma.teamAuditLog
      .create({
        data: {
          user: {
            connect: {
              id: uid,
            },
          },
          team: {
            connect: {
              id: tid,
            },
          },
          content,
          rows: {
            create: pairs.map((p) => ({
              key: p.key,
              value: p.key,
            })),
          },
          type,
        },
      })
      .catch((e) => logger().error(e));
  }
}

export { Teams };
