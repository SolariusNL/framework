import { category } from "@/components/report-user";
import IResponseBase from "@/types/api/IResponseBase";
import Authorized, { Account } from "@/util/api/authorized";
import createNotification from "@/util/notifications";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import { RateLimitMiddleware } from "@/util/rate-limit";
import { getServerConfig } from "@/util/server-config";
import { NotificationType } from "@prisma/client";
import {
  Body,
  Param,
  Post,
  createHandler,
} from "@solariusnl/next-api-decorators";
import { z } from "zod";

export const createAbuseReportSchema = z.object({
  reason: z.string(),
  description: z.string().max(256).min(3),
  links: z.array(z.string().url()),
});
const config = getServerConfig();

class AbuseRouter {
  @Post("/:uid/new")
  @RateLimitMiddleware(5)()
  @Authorized()
  public async createAbuseReport(
    @Account() author: User,
    @Body() body: z.infer<typeof createAbuseReportSchema>,
    @Param("uid") uid: string
  ) {
    const { description, reason, links } = createAbuseReportSchema.parse(body);
    const reporting = Number(uid);

    if (config?.components["abuse-reports"].enabled === false) return <IResponseBase>{
      success: false,
      message: "Abuse reports are not enabled on this instance."
    };

    if (!Object.values(category).find((c) => c === reason)) {
      return <IResponseBase>{
        success: false,
        message: "Invalid report category",
      };
    }

    if (
      config?.components["abuse-reports"].runHostnameCheck &&
      links.some(
        (l) =>
          !l.startsWith(`http://${process.env.NEXT_PUBLIC_HOSTNAME}`) &&
          !l.startsWith(`https://${process.env.NEXT_PUBLIC_HOSTNAME}`)
      )
    ) {
      return <IResponseBase>{
        success: false,
        message: "Invalid link - does not belong to Framework",
      };
    }

    if (author.id === reporting)
      return <IResponseBase>{
        success: false,
        message: "You cannot report yourself",
      };

    const reportingUser = await prisma.user.findFirst({
      where: {
        id: reporting,
      },
    });

    if (!reportingUser)
      return <IResponseBase>{
        success: false,
        message: "The user you're trying to report does not exist",
      };

    await prisma.userReport.create({
      data: {
        author: {
          connect: {
            id: author.id,
          },
        },
        user: {
          connect: {
            id: reportingUser.id,
          },
        },
        reason,
        description,
        links,
      },
    });

    const adminsToNotify = await prisma.user.findMany({
      where: { notificationPreferences: { has: "ADMIN_REPORTS" } },
    });

    adminsToNotify.forEach(async (admin) => {
      await createNotification(
        admin.id,
        NotificationType.ALERT,
        `There is a new report to review for @${reportingUser.username}.`,
        "New report"
      );
    });

    return <IResponseBase>{
      success: true,
      message: "Report submitted successfully",
    };
  }
}

export default createHandler(AbuseRouter);
