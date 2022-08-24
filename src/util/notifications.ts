import { NotificationType } from "@prisma/client";
import prisma from "./prisma";

async function createNotification(
  uid: number,
  type: NotificationType,
  message: string,
  title: string,
) {
  await prisma.notification.create({
    data: {
      user: {
        connect: {
          id: Number(uid),
        },
      },
      type: type,
      message: message,
      title: title,
    },
  });
}

export default createNotification;
