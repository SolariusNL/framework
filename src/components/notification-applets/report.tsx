import { notificationMetadata } from "@/data/notification-metadata";
import { getReportStateColor, getReportStateLabel } from "@/data/report-state";
import { Flow } from "@/stores/useFlow";
import cast from "@/util/cast";
import { Fw } from "@/util/fw";
import { Badge, Button } from "@mantine/core";
import { Notification, NotificationType } from "@prisma/client";
import { useRouter } from "next/router";
import { z } from "zod";

type ReportNotificationApplet = {
  notification: Notification;
};

const ReportNotificationApplet: React.FC<ReportNotificationApplet> = ({
  notification,
}) => {
  const successMetadata = cast<
    z.infer<typeof notificationMetadata.REPORT_SUCCESS>
  >(notification.metadata);
  const processedMetadata = cast<
    z.infer<typeof notificationMetadata.REPORT_PROCESSED>
  >(notification.metadata);
  const router = useRouter();

  return (
    <>
      {cast<Array<NotificationType>>([
        NotificationType.REPORT_SUCCESS,
        NotificationType.REPORT_PROCESSED,
      ]).includes(notification.type) && (
        <div className="flex items-center gap-3">
          <Badge
            color={
              notification.type === NotificationType.REPORT_PROCESSED
                ? getReportStateColor(processedMetadata.state)
                : "orange"
            }
            radius="sm"
            className="!px-2"
          >
            {notification.type === NotificationType.REPORT_PROCESSED
              ? getReportStateLabel(processedMetadata.state)
              : "Processing"}
          </Badge>
          <Button
            size="xs"
            variant="subtle"
            my="xs"
            onClick={() => {
              const id = successMetadata.reportId;
              Fw.Flows.toggleFlow(Flow.ViewReport, router, {
                reportId: id,
              });
            }}
          >
            View report
          </Button>
        </div>
      )}
    </>
  );
};

export default ReportNotificationApplet;
