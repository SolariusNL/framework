import IResponseBase from "@/types/api/IResponseBase";
import Authorized, { Account } from "@/util/api/authorized";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import { RateLimitMiddleware } from "@/util/rate-limit";
import {
  Reportable,
  prismaReportAbuseTypeMap,
  reportCategories,
} from "@/util/types";
import {
  AbuseReportContentIdType,
  AbuseReportState,
  Prisma,
} from "@prisma/client";
import { Body, Post, createHandler } from "@storyofams/next-api-decorators";
import { z } from "zod";

export const createAbuseReportSchema = z.object({
  contentType: z.string(),
  contentId: z.string(),
  category: z.string().refine((val) => reportCategories.includes(val)),
  description: z.string().max(500),
});

class AbuseRouter {
  @Post("/new")
  @RateLimitMiddleware(5)()
  @Authorized()
  public async createAbuseReport(
    @Account() author: User,
    @Body() body: z.infer<typeof createAbuseReportSchema>
  ) {
    const { contentId, category, description, contentType } =
      createAbuseReportSchema.parse(body);
    const type = contentType as Reportable;

    if (!prismaReportAbuseTypeMap[type]) {
      return <IResponseBase>{
        success: false,
        message: "Invalid report type provided",
      };
    }

    const queryExecutor = prisma[prismaReportAbuseTypeMap[type]] as never as {
      findFirst: (args: Prisma.CatalogItemFindFirstArgs) => Promise<any>;
    };

    const content = await queryExecutor.findFirst({
      where: {
        id: contentId,
      },
    });

    if (!content) {
      return <IResponseBase>{
        success: false,
        message: "Invalid content ID provided",
      };
    }

    const contentIdIsNumber = !isNaN(Number(contentId));

    await prisma.abuseReport.create({
      data: {
        author: {
          connect: {
            id: author.id,
          },
        },
        state: AbuseReportState.OPEN,
        contentIdType: contentIdIsNumber
          ? AbuseReportContentIdType.NUMBER
          : AbuseReportContentIdType.STRING,
        category,
        description,
        contentType,
        contentId,
      },
    });

    return <IResponseBase>{
      success: true,
      message: "Report submitted successfully",
    };
  }
}

export default createHandler(AbuseRouter);
