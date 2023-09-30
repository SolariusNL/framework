import { categories } from "@/pages/support";
import Authorized, { Account } from "@/util/api/authorized";
import getMediaUrl from "@/util/get-media";
import { sendMail } from "@/util/mail";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import { nonCurrentUserSelect } from "@/util/prisma-types";
import { RateLimitMiddleware } from "@/util/rate-limit";
import { supportSanitization } from "@/util/sanitize";
import { SupportTicketStatus } from "@prisma/client";
import { render } from "@react-email/render";
import {
  Body,
  createHandler,
  Get,
  Post,
} from "@solariusnl/next-api-decorators";
import AccountUpdate from "email/emails/account-update";
import SupportTicketCreated from "email/emails/support-ticket-created";
import sanitize from "sanitize-html";
import z, { ZodLiteral } from "zod";

class SupportRouter {
  @Post("/submit")
  @RateLimitMiddleware(3)()
  public async submitSupportForm(@Account() user: User, @Body() body: unknown) {
    const schema = z.object({
      title: z.string().min(3).max(100),
      contentMd: z.string().min(10).max(2048),
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
        content: sanitize(data.data.contentMd, supportSanitization),
        contentMd: data.data.contentMd,
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
      String(data.data.contactEmail),
      "New support ticket",
      render(
        SupportTicketCreated({
          title: data.data.title,
          category:
            data.data.category.substring(0, 1).toUpperCase() +
            data.data.category.substring(1),
          contactEmail: data.data.contactEmail,
          contactName: data.data.contactName || "N/A",
        }) as React.ReactElement
      )
    );
    sendMail(
      String(process.env.SUPPORT_EMAIL),
      "New support ticket",
      `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; box-sizing: border-box;">
        <h1 style="font-size: 24px; color: #333; margin-bottom: 20px;">New Support Ticket</h1>
        <p style="font-size: 16px; color: #666;">A new support ticket has been submitted on the website:</p>
        <ul style="list-style: none; margin: 0; padding: 0;">
            <li style="margin-bottom: 10px;">
              <strong style="display: block; font-size: 16px; color: #333;">Title:</strong> ${
                data.data.title
              }
            </li>
            <li style="margin-bottom: 10px;">
              <strong style="display: block; font-size: 16px; color: #333;">Content:</strong> ${
                data.data.contentMd
              }
            </li>
            <li style="margin-bottom: 10px;">
              <strong style="display: block; font-size: 16px; color: #333;">Category:</strong> ${
                data.data.category.substring(0, 1).toUpperCase() +
                data.data.category.substring(1)
              }
            </li>
            <li style="margin-bottom: 10px;">
              <strong style="display: block; font-size: 16px; color: #333;">Contact Email:</strong> ${
                data.data.contactEmail
              }
            </li>
            <li style="margin-bottom: 10px;">
              <strong style="display: block; font-size: 16px; color: #333;">Contact Name:</strong> ${
                data.data.contactName
              }
            </li>
        </ul>
        <h2 style="font-size: 20px; color: #333; margin-top: 20px; margin-bottom: 10px;">User</h2>
        <div style="display: flex; align-items: center;">
            ${
              user
                ? `<img src="${getMediaUrl(
                    user.avatarUri
                  )}" alt="User Avatar" style="width: 24px; height: 24px; margin-right: 10px;" />
              <strong style="font-size: 16px; color: #333;">${
                user.username
              }</strong>`
                : "<strong style='font-size: 16px; color: #333;'>Anonymous</strong>"
            }
        </div>
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
      include: {
        author: nonCurrentUserSelect,
        claimedBy: nonCurrentUserSelect,
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

  @Post("/dmca")
  @RateLimitMiddleware(5)()
  public async submitDMCAForm(@Body() body: unknown) {
    const schema = z.object({
      from: z.string().email(),
      authorized: z.union([
        z.literal("copyright-holder"),
        z.literal("authorized-agent"),
        z.literal("not-authorized"),
      ]),
      isOnFramework: z.boolean(),
      descriptionOfCopyrightOwnership: z.string(),
      descriptionOfInfringement: z.string(),
      urls: z.array(z.string().url()),
      desiredRemoved: z.array(z.string().url()),
      hasAntiCircumvention: z.boolean(),
      isViolatingOpenSource: z.boolean(),
      solution: z.union([
        z.literal("remove"),
        z.literal("private"),
        z.literal("other"),
      ]),
      infringerContactInformation: z.string(),
      goodFaith: z.boolean(),
      swearOfPerjury: z.boolean(),
      fairUse: z.boolean(),
      contactInformation: z.string(),
      fullLegalName: z.string(),
    });

    const data = schema.parse(body);
    const fields = [
      ["From", data.from],
      ["Authorized", data.authorized],
      ["On Framework", data.isOnFramework],
      [
        "Description of Copyright Ownership",
        data.descriptionOfCopyrightOwnership,
      ],
      ["Description of Infringement", data.descriptionOfInfringement],
      ["URLs", data.urls.join(", ")],
      ["Desired Removed", data.desiredRemoved.join(", ")],
      ["Has Anti-Circumvention", data.hasAntiCircumvention],
      ["Is Violating Open Source", data.isViolatingOpenSource],
      ["Solution", data.solution],
      ["Infringer Contact Information", data.infringerContactInformation],
      ["Good Faith", data.goodFaith],
      ["Swear of Perjury", data.swearOfPerjury],
      ["Fair Use", data.fairUse],
      ["Contact Information", data.contactInformation],
      ["Full Legal Name", data.fullLegalName],
    ];

    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; box-sizing: border-box;">
        <h1 style="font-size: 24px; color: #333; margin-bottom: 20px;">New DMCA Form</h1>
        <p style="font-size: 16px; color: #666;">A new DMCA form has been submitted on the website:</p>
        <ul style="list-style: none; margin: 0; padding: 0;">
          ${fields
            .map(
              ([key, value]) => `
            <li style="margin-bottom: 10px;"> 
              <strong style="display: block; font-size: 16px; color: #333;">${key}:</strong> ${value}
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
    `;

    sendMail(String(process.env.SUPPORT_EMAIL), "New DMCA Form", html);

    sendMail(
      data.from,
      "DMCA Form Submitted",
      render(
        AccountUpdate({
          content:
            "Your DMCA form has been submitted. We will review it shortly. Thank you!",
        }) as React.ReactElement
      )
    );

    return {
      status: 200,
      data: {
        message: "DMCA form submitted",
      },
      message: "DMCA form submitted",
    };
  }
}

export default createHandler(SupportRouter);
