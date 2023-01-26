import {
  Body,
  createHandler,
  Get,
  Post,
} from "@storyofams/next-api-decorators";
import Authorized, { Account } from "../../../util/api/authorized";
import type { User } from "../../../util/prisma-types";
import { RateLimitMiddleware } from "../../../util/rateLimit";
import z, { ZodLiteral } from "zod";
import { categories } from "../../support";
import prisma from "../../../util/prisma";
import { SupportTicketStatus } from "@prisma/client";
import { sendMail } from "../../../util/mail";
import getMediaUrl from "../../../util/getMedia";
import { render } from "@react-email/render";
import SupportTicketCreated from "../../../../email/emails/support-ticket-created";

class SupportRouter {
  @Post("/submit")
  @RateLimitMiddleware(3)()
  public async submitSupportForm(@Account() user: User, @Body() body: unknown) {
    const schema = z.object({
      title: z.string().min(3).max(100),
      content: z.string().min(10).max(1000),
      category: z.union(
        categories.map(([category]) => z.literal(category)) as [
          ZodLiteral<"general">,
          ZodLiteral<"billing">,
          ZodLiteral<"bug">,
          ZodLiteral<"feature">,
          ZodLiteral<"security">,
          ZodLiteral<"hacked">,
          ZodLiteral<"recovery">,
          ZodLiteral<"other">
        ]
      ),
      contactEmail: z.string().email(),
      contactName: z.string().optional(),
      agree: z.literal(true),
    });

    const data = schema.safeParse(body);

    if (!data.success) {
      return {
        status: 400,
        data: {
          error: "Invalid data",
          errors: data.error.issues,
        },
        message: "Invalid data",
      };
    }

    await prisma.supportTicket.create({
      data: {
        title: data.data.title,
        content: data.data.content,
        category: data.data.category,
        contactEmail: data.data.contactEmail,
        contactName: data.data.contactName,
        status: SupportTicketStatus.OPEN,
        ...(user && {
          author: {
            connect: {
              id: user.id,
            },
          },
        }),
      },
    });

    sendMail(
      String(process.env.SUPPORT_EMAIL),
      "New support ticket",
      render(
        SupportTicketCreated({
          title: data.data.title,
          content: data.data.content,
          category:
            data.data.category.substring(0, 1).toUpperCase() +
            data.data.category.substring(1),
          contactEmail: data.data.contactEmail,
          contactName: data.data.contactName || "N/A",
        }) as React.ReactElement
      )
    );
    sendMail(
      data.data.contactEmail,
      "Support ticket created",
      `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; box-sizing: border-box;">
        <h1 style="font-size: 24px; color: #333; margin-bottom: 20px;">Support Ticket Created</h1>
        <p style="font-size: 16px; color: #666;">Your support ticket has been created and will be reviewed by our support team.</p>
        <p style="font-size: 16px; color: #666;">You can view your support ticket status at any time by logging into your account and visiting the support page, and clicking 'View Tickets'.</p>
        <p style="font-size:16px;color:#666;">Thank you for contacting us!</p>
        <hr style="margin: 20px 0;" />
        <h2 style="font-size: 20px; color: #333; margin-top: 20px; margin-bottom: 10px;">Ticket</h2>
        <ul style="list-style: none; margin: 0; padding: 0;">
            <li style="margin-bottom: 10px;">
              <strong style="display: block; font-size: 16px; color: #333;">Title:</strong> ${data.data.title}
            </li>
            <li style="margin-bottom: 10px;">
              <strong style="display: block; font-size: 16px; color: #333;">Content:</strong> ${data.data.content}
            </li>
        </ul>
      </div>
      `
    );

    return {
      status: 200,
      data: {
        message: "Support ticket created",
      },
      message: "Support ticket created",
    };
  }

  @Get("/tickets")
  @Authorized()
  public async getTickets(@Account() user: User) {
    const tickets = await prisma.supportTicket.findMany({
      where: {
        authorId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      status: 200,
      data: {
        tickets,
      },
      message: "Support tickets",
    };
  }
}

export default createHandler(SupportRouter);
