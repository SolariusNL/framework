import {
  Body,
  createHandler,
  Get,
  Param,
  Post,
} from "@storyofams/next-api-decorators";
import { z } from "zod";
import Authorized, { Account } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import type { ChatMessage, User } from "../../../util/prisma-types";
import { chatMessageSelect } from "../../../util/prisma-types";

class ChatRouter {
  @Get("/conversation/:id")
  @Authorized()
  public async getConversationWithId(
    @Account() user: User,
    @Param("id") id: number
  ) {
    if (user.id === id) {
      return {
        error: "You cannot message yourself",
      };
    }

    const to = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!to) {
      return {
        error: "User not found",
      };
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          {
            authorId: Number(id),
            toId: Number(user.id),
          },
          {
            authorId: Number(user.id),
            toId: Number(id),
          },
        ],
      },
      take: 75,
      orderBy: {
        createdAt: "asc",
      },
      select: chatMessageSelect,
    });

    return messages;
  }

  @Post("/conversation/:id/send")
  @Authorized()
  public async sendMessage(
    @Account() user: User,
    @Param("id") id: number,
    @Body() body: unknown
  ) {
    const bodySchema = z.object({
      content: z.string().min(1).max(1000),
    });

    const { content } = bodySchema.parse(body);

    if (user.id === id) {
      return {
        error: "You cannot message yourself",
      };
    }

    const to = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!to) {
      return {
        error: "User not found",
      };
    }

    const conversationLength = await prisma.chatMessage.count({
      where: {
        OR: [
          {
            authorId: Number(id),
            toId: Number(user.id),
          },
          {
            authorId: Number(user.id),
            toId: Number(id),
          },
        ],
      },
    });

    if (conversationLength >= 75) {
      const oldestMessage = await prisma.chatMessage.findFirst({
        where: {
          OR: [
            {
              authorId: Number(id),
              toId: Number(user.id),
            },
            {
              authorId: Number(user.id),
              toId: Number(id),
            },
          ],
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
        },
      });

      if (oldestMessage) {
        await prisma.chatMessage.delete({
          where: {
            id: oldestMessage.id,
          },
        });
      }
    }

    const message = await prisma.chatMessage.create({
      data: {
        author: {
          connect: {
            id: Number(user.id),
          },
        },
        to: {
          connect: {
            id: Number(id),
          },
        },
        content,
      },
      select: chatMessageSelect,
    });

    return message;
  }

  @Post("/conversation/:id/read")
  @Authorized()
  public async readMessage(@Account() user: User, @Param("id") id: number) {
    await prisma.chatMessage.updateMany({
      where: {
        authorId: Number(id),
        toId: Number(user.id),
      },
      data: {
        seen: true,
      },
    });

    return {
      success: true,
    };
  }

  @Get("/unread")
  @Authorized()
  public async getUnreadMessages(@Account() user: User) {
    const messages: ChatMessage[] = (await prisma.chatMessage.findMany({
      where: {
        toId: Number(user.id),
        seen: false,
      },
      select: chatMessageSelect,
    })) as any;

    const conversations: Record<number, typeof messages> = {};

    messages.forEach((message) => {
      const id = message.authorId;

      if (!conversations[id]) {
        conversations[id] = [];
      }

      conversations[id].push(message);
    });

    return conversations;
  }
}

export default createHandler(ChatRouter);
