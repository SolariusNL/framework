import ResourceCard from "@/components/admin/resource-card";
import StatsGrid from "@/components/admin/stats-grid";
import ModernEmptyState from "@/components/modern-empty-state";
import ReportCard from "@/components/report-card";
import ShadedButton from "@/components/shaded-button";
import ShadedCard from "@/components/shaded-card";
import getMediaUrl from "@/util/get-media";
import useMediaQuery from "@/util/media-query";
import { NonUser, Report } from "@/util/prisma-types";
import { Avatar, Grid, Stack, Text, Title } from "@mantine/core";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HiKey,
  HiServer,
  HiUser,
  HiUsers,
  HiViewGrid,
  HiXCircle,
} from "react-icons/hi";

interface AdminStats {
  user: {
    userDiff: number;
    usersLastMonth: number;
    usersThisMonth: number;
    totalUsers: number;
    bannedUsers: number;
    latestThreeUsers: Array<NonUser & { email: string }>;
  };
  games: {
    totalGames: number;
  };
}

const Dashboard = () => {
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

    await fetch("/api/admin/reports?page=1&sort=unreviewed&reason=", {
      headers: {
        Authorization: String(getCookie(".frameworksession")),
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setReports(res.reports.filter((r: Report) => !r.processed));
      });
  };

  useEffect(() => {
    getStats();
  }, []);

  return (
    <>
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

      <ShadedCard mt={32}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-start gap-2 justify-between">
              <Title order={3} mb={24} className="flex-1 whitespace-nowrap">
                Recent Reports
              </Title>
              <Text size="sm" color="dimmed" align="right">
                Review these reports to help keep the community safe.
              </Text>
            </div>
            <Stack spacing={16}>
              {reports && reports.length > 0 ? (
                reports.map((r) => <ReportCard report={r} key={r.id} />)
              ) : (
                <div className="col-span-3">
                  <ModernEmptyState
                    title="No reports"
                    body="There are no reports to review."
                  />
                </div>
              )}
            </Stack>
          </div>
          <div>
            <div className="flex items-start gap-2 justify-between">
              <Title order={3} mb={24} className="flex-1 whitespace-nowrap">
                New Users
              </Title>
              <Text size="sm" color="dimmed" align="right">
                These users have recently joined the community.
              </Text>
            </div>
            <Stack spacing={16}>
              {stats?.user.latestThreeUsers.length! > 0 ? (
                stats?.user.latestThreeUsers.map((u) => (
                  <Link href={`/profile/${u.username}`} key={u.id}>
                    <ShadedButton>
                      <div className="flex items-center gap-4">
                        <Avatar
                          size={32}
                          radius={99}
                          src={getMediaUrl(u.avatarUri)}
                        />
                        <div>
                          <Text weight={500}>{u.username}</Text>
                          <Text size="sm" color="dimmed">
                            {u.email}
                          </Text>
                        </div>
                      </div>
                    </ShadedButton>
                  </Link>
                ))
              ) : (
                <div className="col-span-3">
                  <ModernEmptyState
                    title="No new users"
                    body="There are no new users to show."
                  />
                </div>
              )}
            </Stack>
          </div>
        </div>
      </ShadedCard>

      <Grid columns={3} mt={32}>
        <Grid.Col span={mobile ? 3 : 1}>
          <ResourceCard
            title="Invite Keys"
            description="Create invite keys in bulk, or individually."
            icon={<HiKey size={28} />}
            link="/admin/keys"
          />
        </Grid.Col>

        <Grid.Col span={mobile ? 3 : 1}>
          <ResourceCard
            title="Users"
            description="Manage users, revoke bans, edit user roles, etc."
            icon={<HiUsers size={28} />}
            link="/admin/users"
          />
        </Grid.Col>

        <Grid.Col span={mobile ? 3 : 1}>
          <ResourceCard
            title="Instance"
            description="Manage this Framework instance, monitor server status, etc."
            icon={<HiServer size={28} />}
            link="/admin/instance"
          />
        </Grid.Col>
      </Grid>
    </>
  );
};

export default Dashboard;
