import { TransactionType } from "@prisma/client";
import prisma from "./prisma";

async function logTransaction(
  tickets: number,
  description: string,
  uid: number,
  type: TransactionType,
  toId?: number,
  toString?: string,
  fromId?: number,
  fromString?: string
) {
  await prisma.transaction.create({
    data: {
      user: {
        connect: {
          id: uid,
        },
      },
      tickets: Number(tickets),
      description,
      type,
      ...(toId
        ? {
            to: {
              connect: {
                id: toId,
              },
            },
          }
        : {
            toString,
          }),
      ...(fromId
        ? {
            from: {
              connect: {
                id: fromId,
              },
            },
          }
        : {
            fromString,
          }),
    },
  });
}

export { logTransaction };
