import prisma from "./prisma";

async function logTransaction(
  to: string,
  tickets: number,
  description: string,
  uid: number
) {
  await prisma.transaction.create({
    data: {
      user: {
        connect: {
          id: uid,
        },
      },
      to,
      tickets: Number(tickets),
      description,
    },
  });
}

export { logTransaction };
