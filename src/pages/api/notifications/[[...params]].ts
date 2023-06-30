import IResponseBase from "@/types/api/IResponseBase";
import Authorized, { Account } from "@/util/api/authorized";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import { Notification, NotificationType } from "@prisma/client";
import {
  Delete,
  Get,
  Param,
  Post,
  Query,
  createHandler,
} from "@storyofams/next-api-decorators";

class NotificationRouter {
  private async getNotification(id: string): Promise<Notification | null> {
    return await prisma.notification.findFirst({
      where: {
        id: String(id),
      },
    });
  }

  private async getNotificationsByType(user: User, type?: NotificationType) {
    return await prisma.notification.findMany({
      where: {
        userId: user.id,
        type: type ? type : undefined,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  private async handlePermissionError(message: string): Promise<IResponseBase> {
    return <IResponseBase>{
      success: false,
      message,
    };
  }

  private async markNotificationAsRead(id: string): Promise<void> {
    await prisma.notification.update({
      where: {
        id: String(id),
      },
      data: {
        seen: true,
      },
    });
  }

  private async deleteNotification(id: string): Promise<void> {
    await prisma.notification.delete({
      where: {
        id: String(id),
      },
    });
  }

  private async markAllNotificationsAsRead(user: User): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        seen: false,
      },
      data: {
        seen: true,
      },
    });
  }

  @Authorized()
  @Post("/:id/read")
  public async readNotification(
    @Param("id") id: string,
    @Account() user: User
  ) {
    const notification = await this.getNotification(id);

    if (!notification) {
      return await this.handlePermissionError("Notification not found");
    }

    if (notification.userId != user.id) {
      return await this.handlePermissionError(
        "You do not have permission to read this notification"
      );
    }

    await this.markNotificationAsRead(id);

    return <IResponseBase>{
      success: true,
      message: "Notification marked as read",
    };
  }

  @Authorized()
  @Delete("/:id/delete")
  public async deleteNotificationHandler(
    @Param("id") id: string,
    @Account() user: User
  ) {
    const notification = await this.getNotification(id);

    if (!notification) {
      return await this.handlePermissionError("Notification not found");
    }

    if (notification.userId != user.id) {
      return await this.handlePermissionError(
        "You do not have permission to delete this notification"
      );
    }

    await this.deleteNotification(id);

    return <IResponseBase>{
      success: true,
      message: "Notification deleted",
    };
  }

  @Get()
  public async getNotifications(
    @Account() user: User,
    @Query("type") type?: NotificationType | "ALL"
  ) {
    const notifications = await this.getNotificationsByType(
      user,
      type === "ALL" ? undefined : type
    );

    return <IResponseBase>{
      success: true,
      data: {
        notifications,
      },
    };
  }

  @Authorized()
  @Post("/mark-all-read")
  public async markAllNotificationsAsReadHandler(@Account() user: User) {
    await this.markAllNotificationsAsRead(user);

    return <IResponseBase>{
      success: true,
      message: "All notifications marked as read",
    };
  }
}

export default createHandler(NotificationRouter);
