import { NotificationType, UserReportState } from "@prisma/client";
import { z } from "zod";

const reportSuccessMetadataSchema = z.object({
  reportId: z.string(),
});
const reportProcessedMetadataSchema = z.object({
  reportId: z.string(),
  state: z.nativeEnum(UserReportState),
});

export const notificationMetadata = {
  [NotificationType.REPORT_SUCCESS]: reportSuccessMetadataSchema,
  [NotificationType.REPORT_PROCESSED]: reportProcessedMetadataSchema,
} as const;
