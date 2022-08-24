import { createHandler, Param, Post } from "@storyofams/next-api-decorators";
import Authorized, { Account } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";

class NotificationRouter {
  @Authorized()
  @Post("/:id/read")
  public async readNotification(
    @Param("id") id: string,
    @Account() user: User
  ) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: String(id),
      },
    });

    if (!notification) {
      return {
        success: false,
        message: "Notification not found",
      };
    }

    if (notification.userId != user.id) {
      return {
        success: false,
        message: "You do not have permission to read this notification",
      };
    }

    await prisma.notification.delete({
      where: {
        id: String(id),
      },
    });

    return {
      success: true,
      message: "Notification read",
    };
  }
}

export default createHandler(NotificationRouter);
