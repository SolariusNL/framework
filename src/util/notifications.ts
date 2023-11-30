import prisma from "@/util/prisma";
import { NotificationType } from "@prisma/client";

async function createNotification(
  uid: number,
  type: NotificationType,
  message: string,
  title: string,
  metadata?: Record<string, unknown>
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
      ...(metadata ? { metadata: JSON.parse(JSON.stringify(metadata)) } : {}),
    },
  });
}

export default createNotification;
