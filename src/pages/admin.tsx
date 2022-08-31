import {
  Avatar,
  Divider,
  Grid,
  Group,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
import { HiUser, HiViewGrid, HiXCircle } from "react-icons/hi";
import StatsGrid from "../components/Admin/StatsGrid";
import EmptyState from "../components/EmptyState";
import Framework from "../components/Framework";
import UserContext from "../components/UserContext";
import authorizedRoute from "../util/authorizedRoute";
import { Report, User } from "../util/prisma-types";
import { getRelativeTime } from "../util/relativeTime";
import useMediaQuery from "../util/useMediaQuery";

interface AdminProps {
  user: User;
}

interface AdminStats {
  user: {
    userDiff: number;
    usersLastMonth: number;
    usersThisMonth: number;
    totalUsers: number;
    bannedUsers: number;
  };
  games: {
    totalGames: number;
  };
}

const Admin: NextPage<AdminProps> = ({ user }) => {
  const [stats, setStats] = useState<AdminStats | undefined>(undefined);
  const [reports, setReports] = useState<Report[] | undefined>(undefined);

  const mobile = useMediaQuery("768");

  const getStats = async () => {
    await fetch("/api/admin/analytics", {
      headers: {
        Authorization: String(getCookie(".frameworksession")),
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setStats(res);
      });

    await fetch("/api/admin/reports", {
      headers: {
        Authorization: String(getCookie(".frameworksession")),
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setReports(res);
      });
  };

  useEffect(() => {
    getStats();
  }, []);

  return (
    <Framework user={user} activeTab="none">
      <Title mb={24}>Admin</Title>

      <StatsGrid>
        <StatsGrid.Item
          title="Users"
          value={Number(stats?.user.totalUsers)}
          icon={<HiUser />}
          diff={stats?.user.userDiff}
          hasDiff
          diffHint="Compared to previous month"
        />
        <StatsGrid.Item
          title="Banned Users"
          value={Number(stats?.user.bannedUsers)}
          icon={<HiXCircle />}
        />
        <StatsGrid.Item
          title="Games"
          value={Number(stats?.games.totalGames)}
          icon={<HiViewGrid />}
        />
      </StatsGrid>

      <Divider mt={36} mb={36} />

      <Title order={3} mb={24}>
        Recent Reports
      </Title>
      {reports?.length === 0 ? (
        <EmptyState title="No reports" body="No reports to show." />
      ) : (
        <Grid columns={6}>
          {reports?.map((report) => (
            <Grid.Col key={report.id} span={mobile ? 6 : 2}>
              <Paper
                radius="md"
                withBorder
                p="lg"
                sx={(theme) => ({
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[8]
                      : theme.white,
                })}
              >
                <Group mb={10}>
                  <UserContext user={report.author}>
                    <Avatar
                      src={report.author.avatarUri}
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
                  {report.description.length > 0
                    ? report.description
                    : "No description"}
                </Text>

                <Text size="sm" color="dimmed" weight={500}>
                  {getRelativeTime(new Date(report.createdAt))}
                </Text>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false, true);
}

export default Admin;
