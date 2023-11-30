import { category } from "@/components/report-user";
import { notificationMetadata } from "@/data/notification-metadata";
import IResponseBase from "@/types/api/IResponseBase";
import Authorized, { Account } from "@/util/api/authorized";
import createNotification from "@/util/notifications";
import prisma from "@/util/prisma";
import {
  nonCurrentUserSelect,
  type NonUser,
  type User,
} from "@/util/prisma-types";
import { RateLimitMiddleware } from "@/util/rate-limit";
import { getServerConfig } from "@/util/server-config";
import { NotificationType, UserReport } from "@prisma/client";
import {
  Body,
  createHandler,
  Get,
  Param,
  Post,
} from "@solariusnl/next-api-decorators";
import { z } from "zod";

export type ViewableReport = UserReport & {
  user: NonUser;
};
export type GetReportByIdResponse = IResponseBase<{
  report: ViewableReport;
}>;

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
    const abuseConfig = config?.components["abuse-reports"];

    if (abuseConfig.enabled === false)
      return <IResponseBase>{
        success: false,
        message: "Abuse reports are not enabled on this instance.",
      };

    if (!Object.values(category).find((c) => c === reason)) {
      return <IResponseBase>{
        success: false,
        message: "Invalid report category",
      };
    }

    if (
      abuseConfig.runHostnameCheck &&
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

    const previousReports = await prisma.userReport.findMany({
      where: {
        authorId: author.id,
        userId: reporting,
        createdAt: {
          gte: new Date(Date.now() - abuseConfig.limit.frequency),
        },
      },
    });

    if (previousReports.length >= abuseConfig.limit.count) {
      const recurrence = abuseConfig.limit.count;
      const time = abuseConfig.limit.frequency / 1000 / 60 / 60;
      return <IResponseBase>{
        success: false,
        message:
          "You cannot report the same user more than " +
          recurrence +
          " times every " +
          time +
          " hours",
      };
    }

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

    const report = await prisma.userReport.create({
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
        reason:
          Object.keys(category).find(
            (key) => category[key as keyof typeof category] === reason
          ) || "Other",
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
    await createNotification(
      author.id,
      NotificationType.REPORT_SUCCESS,
      `Your report against @${reportingUser.username} has been submitted and will be reviewed by Solarius. Thank you for your patience.`,
      "Report submitted",
      <z.infer<typeof notificationMetadata.REPORT_SUCCESS>>{
        reportId: report.id,
      }
    );

    return <IResponseBase>{
      success: true,
      message: "Report submitted successfully",
    };
  }

  @Get("/:reportid")
  @Authorized()
  public async getReport(@Param("reportid") reportid: string) {
    const report = await prisma.userReport.findUnique({
      where: {
        id: reportid,
      },
      include: {
        user: nonCurrentUserSelect,
      },
    });

    if (!report)
      return <GetReportByIdResponse>{
        success: false,
        message: "Report not found",
      };

    return <GetReportByIdResponse>{
      success: true,
      data: {
        report,
      },
    };
  }
}

export default createHandler(AbuseRouter);
