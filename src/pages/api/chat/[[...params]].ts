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
import type { User } from "../../../util/prisma-types";
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
      orderBy: {
        createdAt: "asc",
      },
      take: 100,
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
}

export default createHandler(ChatRouter);
