import Authorized, { Account } from "@/util/api/authorized";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import { messageSelect } from "@/util/prisma-types";
import {
  Body,
  createHandler,
  Get,
  Param,
  Post,
} from "@solariusnl/next-api-decorators";

class MessageRouter {
  @Post("/new/:recipientId")
  @Authorized()
  public async newMessage(
    @Account() user: User,
    @Param("recipientId") recipientId: number,
    @Body() reqBody: { title: string; body: string; important: boolean }
  ) {
    const { title, body, important } = reqBody;
    const recipient = await prisma.user.findFirst({
      where: {
        id: Number(recipientId),
      },
    });

    if (!recipient) {
      return {
        status: 404,
        body: {
          error: "Recipient not found",
        },
      };
    }

    if (title.length < 3 || title.length > 32) {
      return {
        status: 400,
        body: {
          error: "Title must be between 3 and 32 characters",
        },
      };
    }

    if (body.length < 3 || body.length > 256) {
      return {
        status: 400,
        body: {
          error: "Body must be between 3 and 256 characters",
        },
      };
    }

    await prisma.message.create({
      data: {
        title,
        message: body,
        important,
        sender: {
          connect: {
            id: user.id,
          },
        },
        recipient: {
          connect: {
            id: recipient.id,
          },
        },
      },
    });

    return {
      status: 200,
      success: true,
      message: "Message sent",
    };
  }

  @Get("/my")
  @Authorized()
  public async getMyMessages(@Account() user: User) {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: user.id,
          },
          {
            recipientId: user.id,
          },
        ],
      },
      select: messageSelect,
    });

    return messages;
  }

  @Post("/msg/:messageId/read")
  @Authorized()
  public async readMessage(
    @Account() user: User,
    @Param("messageId") messageId: String
  ) {
    const message = await prisma.message.findFirst({
      where: {
        id: String(messageId),
        recipientId: user.id,
      },
    });

    if (!message) {
      return {
        status: 404,
        body: {
          error: "Message not found",
        },
      };
    }

    await prisma.message.update({
      where: {
        id: message.id,
      },
      data: {
        read: !message.read,
      },
    });

    return {
      status: 200,
      success: true,
      message: "Message read status updated",
    };
  }

  @Post("/msg/:messageId/archive")
  @Authorized()
  public async archiveMessage(
    @Account() user: User,
    @Param("messageId") messageId: String
  ) {
    const message = await prisma.message.findFirst({
      where: {
        id: String(messageId),
        recipientId: user.id,
      },
    });

    if (!message) {
      return {
        status: 404,
        body: {
          error: "Message not found",
        },
      };
    }

    await prisma.message.update({
      where: {
        id: message.id,
      },
      data: {
        archived: !message.archived,
      },
    });

    return {
      status: 200,
      success: true,
      message: "Message archived status updated",
    };
  }
}

export default createHandler(MessageRouter);
