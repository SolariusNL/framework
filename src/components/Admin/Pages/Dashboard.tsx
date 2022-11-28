import { Divider, Grid, Title } from "@mantine/core";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import {
  HiKey,
  HiServer,
  HiUser,
  HiUsers,
  HiViewGrid,
  HiXCircle,
} from "react-icons/hi";
import { Report } from "../../../util/prisma-types";
import useMediaQuery from "../../../util/useMediaQuery";
import ModernEmptyState from "../../ModernEmptyState";
import ReportCard from "../../ReportCard";
import ResourceCard from "../ResourceCard";
import StatsGrid from "../StatsGrid";

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

      <Divider mt={36} mb={36} />

      <Title order={3} mb={24}>
        Recent Reports
      </Title>
      {reports?.length === 0 ? (
        <ModernEmptyState title="No reports" body="No reports to show." />
      ) : (
        <Grid columns={6}>
          {reports?.slice(0, 6).map((report) => (
            <Grid.Col key={report.id} span={mobile ? 6 : 2}>
              <ReportCard report={report} />
            </Grid.Col>
          ))}
        </Grid>
      )}

      <Divider mt={36} mb={36} />

      <Grid columns={3}>
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
