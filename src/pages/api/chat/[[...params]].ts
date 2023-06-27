import {
  Body,
  createHandler,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@storyofams/next-api-decorators";
import { z } from "zod";
import Authorized, { Account } from "@/util/api/authorized";
import registerAutomodHandler from "@/util/automod";
import { Fw } from "@/util/fw";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import {
  chatMessageSelect,
  nonCurrentUserSelect,
} from "@/util/prisma-types";
import { RateLimitMiddleware } from "@/util/rate-limit";

const lastEmailSent = new Map<number, Date>();
const chatAutomod = registerAutomodHandler("Chat message");

class ChatRouter {
  @Get("/conversation/:id")
  @Authorized()
  public async getConversationWithId(
    @Account() user: User,
    @Param("id") id: string
  ) {
    const conversation = await prisma.chatConversation.findUnique({
      where: {
        id: String(id),
      },
    });

    if (!conversation) {
      return {
        error: "Conversation not found",
      };
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        conversationId: conversation.id,
      },
      take: 75,
      orderBy: {
        createdAt: "desc",
      },
      select: chatMessageSelect,
    });

    return messages;
  }

  @Post("/conversation/:id/send")
  @RateLimitMiddleware(75)()
  @Authorized()
  public async sendMessage(
    @Account() user: User,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const bodySchema = z.object({
      content: z.string().min(1).max(1000),
    });

    const { content } = bodySchema.parse(body);

    const to = await prisma.chatConversation.findUnique({
      where: {
        id: String(id),
      },
    });

    if (!to) {
      return {
        error: "Conversation not found",
      };
    }

    const message = await prisma.chatMessage.create({
      data: {
        author: {
          connect: {
            id: Number(user.id),
          },
        },
        conversation: {
          connect: {
            id: String(id),
          },
        },
        content,
      },
      select: chatMessageSelect,
    });
    await prisma.chatConversation.update({
      where: {
        id: String(id),
      },
      data: {
        updatedAt: new Date(),
      },
    });

    chatAutomod(user.id, content);

    return message;
  }

  @Delete("/msg/:msgid")
  @Authorized()
  public async deleteMessage(
    @Account() user: User,
    @Param("msgid") msgid: string
  ) {
    const msg = await prisma.chatMessage.findFirst({
      where: {
        id: msgid,
        authorId: user.id,
      },
    });

    if (!msg)
      return {
        success: false,
        message: "No message found with corresponding identifiers",
      };

    await prisma.chatMessage.delete({
      where: {
        id: msg.id,
      },
    });

    return {
      success: true,
    };
  }

  @Post("/conversation/:id/read")
  @Authorized()
  public async readMessage(@Account() user: User, @Param("id") id: string) {
    const msgs = await prisma.chatMessage.findMany({
      where: {
        conversationId: String(id),
      },
      include: {
        seenBy: {
          select: {
            id: true,
          },
        },
      },
    });

    if (msgs) {
      for (const msg of msgs) {
        if (!msg.seenBy.find((u) => u.id === user.id)) {
          await prisma.chatMessage.update({
            where: {
              id: msg.id,
            },
            data: {
              seenBy: {
                connect: {
                  id: user.id,
                },
              },
            },
          });
        }
      }
    }

    return {
      success: true,
    };
  }

  @Get("/unread")
  @Authorized()
  public async getUnreadMessages(@Account() user: User) {
    const memberOf = await prisma.chatConversation.findMany({
      where: {
        OR: [
          {
            ownerId: Number(user.id),
          },
          {
            participants: {
              some: {
                id: Number(user.id),
              },
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });

    const messages = await prisma.chatMessage.findMany({
      where: {
        conversationId: {
          in: memberOf.map((c) => c.id),
        },
        seenBy: {
          none: {
            id: Number(user.id),
          },
        },
        authorId: {
          not: Number(user.id),
        },
      },
      select: chatMessageSelect,
    });

    const conversations: Record<string, typeof messages> = {};

    for (const message of messages) {
      if (!conversations[message.conversationId as string]) {
        conversations[message.conversationId as string] = [];
      }

      conversations[message.conversationId as string].push(message);
    }

    return conversations;
  }

  @Get("/conversations")
  @Authorized()
  public async getConversations(@Account() user: User) {
    const conversations = await prisma.chatConversation.findMany({
      where: {
        OR: [
          {
            ownerId: Number(user.id),
          },
          {
            participants: {
              some: {
                id: Number(user.id),
              },
            },
          },
        ],
      },
      include: {
        participants: {
          select: nonCurrentUserSelect.select,
        },
        owner: {
          select: nonCurrentUserSelect.select,
        },
      },
    });

    return {
      success: true,
      data: {
        conversations,
      },
    };
  }

  @Post("/conversation")
  @RateLimitMiddleware(5)()
  @Authorized()
  public async createConversation(
    @Account() user: User,
    @Body() body: unknown
  ) {
    const bodySchema = z.object({
      name: z.string().max(32).default(""),
      participants: z.array(z.number()),
    });

    const { name, participants } = bodySchema.parse(body);

    if (participants.length < 1) {
      return {
        success: false,
        message: "You must have at least one participant",
      };
    }

    if (participants.length > 10) {
      return {
        success: false,
        message: "You can only have up to 10 participants",
      };
    }

    if (participants.includes(user.id)) {
      return {
        success: false,
        message: "You cannot add yourself to a conversation",
      };
    }

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: participants,
        },
      },
    });

    if (users.length !== participants.length) {
      return {
        success: false,
        message: "One or more users not found",
      };
    }

    await prisma.chatConversation.create({
      data: {
        name:
          name !== ""
            ? name
            : Fw.Strings.limitLength(
                users.map((u) => u.username).join(", ") + ", " + user.username,
                32
              ),
        ownerId: user.id,
        participants: {
          connect: [
            {
              id: user.id,
            },
            ...users.map((u) => ({
              id: u.id,
            })),
          ],
        },
        direct: participants.length < 2,
      },
      select: {
        id: true,
        participants: {
          select: {
            id: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Conversation created",
    };
  }

  @Post("/conversation/:id/remove/:userid")
  @RateLimitMiddleware(15)()
  @Authorized()
  public async removeUserFromConversation(
    @Account() user: User,
    @Param("id") id: string,
    @Param("userid") userid: string
  ) {
    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id,
        ownerId: user.id,
      },
    });

    if (!conversation) {
      return {
        success: false,
        message: "Conversation not found",
      };
    }

    if (conversation.ownerId === Number(userid)) {
      return {
        success: false,
        message: "You cannot remove yourself from a conversation",
      };
    }

    await prisma.chatConversation.update({
      where: {
        id,
      },
      data: {
        participants: {
          disconnect: [
            {
              id: Number(userid),
            },
          ],
        },
      },
      select: {
        participants: {
          select: {
            id: true,
          },
        },
        id: true,
      },
    });

    return {
      success: true,
      message: "User removed from conversation",
    };
  }

  @Post("/conversation/:id/add/:userid")
  @RateLimitMiddleware(20)()
  @Authorized()
  public async addUserToConversation(
    @Account() user: User,
    @Param("id") id: string,
    @Param("userid") userid: string
  ) {
    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id,
        ownerId: user.id,
      },
    });

    if (!conversation) {
      return {
        success: false,
        message: "Conversation not found",
      };
    }

    await prisma.chatConversation.update({
      where: {
        id,
      },
      data: {
        participants: {
          connect: [
            {
              id: Number(userid),
            },
          ],
        },
      },
      select: {
        participants: {
          select: {
            id: true,
          },
        },
        id: true,
      },
    });

    return {
      success: true,
      message: "User added to conversation",
    };
  }

  @Post("/conversation/:id/leave")
  @Authorized()
  public async leaveConversation(
    @Account() user: User,
    @Param("id") id: string
  ) {
    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id,
        participants: {
          some: {
            id: user.id,
          },
        },
      },
    });

    if (!conversation) {
      return {
        success: false,
        message: "Conversation not found",
      };
    }

    if (conversation.ownerId === user.id) {
      const newOwner = await prisma.user.findFirst({
        where: {
          id: {
            not: user.id,
          },
          participatingConversations: {
            some: {
              id,
            },
          },
        },
      });

      if (!newOwner) {
        await prisma.chatConversation.update({
          where: {
            id,
          },
          data: {
            participants: {
              disconnect: [
                {
                  id: user.id,
                },
              ],
            },
          },
        });
        await prisma.chatMessage.deleteMany({
          where: {
            conversationId: id,
          },
        });
        await prisma.chatConversation.delete({
          where: {
            id,
          },
        });

        return {
          success: true,
          message: "Left conversation",
        };
      }

      await prisma.chatConversation.update({
        where: {
          id,
        },
        data: {
          ownerId: newOwner?.id,
        },
      });
    }

    await prisma.chatConversation.update({
      where: {
        id,
      },
      data: {
        participants: {
          disconnect: [
            {
              id: user.id,
            },
          ],
        },
      },
    });

    return {
      success: true,
      message: "Left conversation",
    };
  }

  @Patch("/conversation/:id/name")
  @Authorized()
  public async renameConversation(
    @Account() user: User,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const bodySchema = z.object({
      name: z.string().min(1).max(32),
    });

    const { name } = bodySchema.parse(body);

    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id,
        participants: {
          some: {
            id: user.id,
          },
        },
      },
    });

    if (!conversation) {
      return {
        success: false,
        message: "Conversation not found",
      };
    }

    await prisma.chatConversation.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });

    return {
      success: true,
      message: "Conversation renamed",
    };
  }
}

export default createHandler(ChatRouter);
