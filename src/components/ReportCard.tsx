import ShadedButton from "@/components/ShadedButton";
import UserContext from "@/components/UserContext";
import getMediaUrl from "@/util/get-media";
import { Report } from "@/util/prisma-types";
import { getRelativeTime } from "@/util/relative-time";
import { Avatar, Badge, Text } from "@mantine/core";
import { useRouter } from "next/router";

interface ReportCardProps {
  report: Report;
}

const ReportCard = ({ report }: ReportCardProps) => {
  const router = useRouter();

  return (
    <ShadedButton
      onClick={() => router.push(`/admin/report/${report.id}`)}
      className="h-fit"
    >
      <div className="w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <UserContext user={report.author}>
              <Avatar
                src={getMediaUrl(report.author.avatarUri)}
                size={24}
                radius={999}
              />
            </UserContext>
            <Text size="sm">
              <Text size="sm" color="dimmed">
                {report.author.username}
              </Text>
            </Text>
          </div>
          <Badge color={report.processed ? "blue" : "orange"}>
            {report.processed ? "Reviewed" : "Awaiting review"}
          </Badge>
        </div>
        <Text size="lg" weight={500} mb="sm">
          {report.reason}
        </Text>
        <Text size="sm" lineClamp={3} mb="md">
          {report.description}
        </Text>
        <div className="flex justify-end">
          <Text size="sm" color="dimmed">
            {getRelativeTime(new Date(report.createdAt))}
          </Text>
        </div>
      </div>
    </ShadedButton>
  );
};

export default ReportCard;
