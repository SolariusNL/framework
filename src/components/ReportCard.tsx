import { Avatar, Group, Paper, Text, Title } from "@mantine/core";
import { useRouter } from "next/router";
import getMediaUrl from "../util/getMedia";
import { Report } from "../util/prisma-types";
import { getRelativeTime } from "../util/relativeTime";
import UserContext from "./UserContext";

interface ReportCardProps {
  report: Report;
}

const ReportCard = ({ report }: ReportCardProps) => {
  const router = useRouter();

  return (
    <Paper
      radius="md"
      withBorder
      p="lg"
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
        cursor: "pointer",
      })}
      onClick={() => router.push(`/admin/report/${report.id}`)}
      onMouseDown={(e: React.MouseEvent) => {
        if (e.button === 1) {
          window.open(`/admin/report/${report.id}`, "_blank");
        }
      }}
    >
      <Group mb={10}>
        <UserContext user={report.author}>
          <Avatar
            src={getMediaUrl(report.author.avatarUri)}
            alt={report.author.username}
            radius={99}
            size={28}
          />
        </UserContext>

        <Text size="sm" color="dimmed" weight={500}>
          {report.author.username} • Report author
        </Text>
      </Group>

      <Title order={4} mb={10}>
        {report.reason}
      </Title>
      <Text lineClamp={3} mb={24}>
        {report.description.length > 0 ? report.description : "No description"}
      </Text>

      <Text size="sm" color="dimmed" weight={500}>
        {getRelativeTime(new Date(report.createdAt))}
      </Text>
    </Paper>
  );
};

export default ReportCard;