import {
  ActionIcon,
  Avatar,
  Divider,
  Group,
  SimpleGrid,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
import { HiArrowRight, HiUser, HiViewGrid, HiXCircle } from "react-icons/hi";
import StatsGrid from "../components/Admin/StatsGrid";
import Framework from "../components/Framework";
import authorizedRoute from "../util/authorizedRoute";
import { Report, User } from "../util/prisma-types";

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

      <Title order={3} mb={10}>
        Recent Reports
      </Title>
      <Table highlightOnHover striped>
        <thead>
          <tr>
            <th>Author</th>
            <th>Reported User</th>
            <th>Category</th>
            <th>Details</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {reports &&
            reports?.map((report) => (
              <tr key={report.id}>
                <td>
                  <Group>
                    <Avatar
                      src={
                        report.author.avatarUri ||
                        `https://avatars.dicebear.com/api/identicon/${report.author.id}.png`
                      }
                      radius={999}
                      size={30}
                    />
                    <Text weight={500} color="dimmed" size="sm">
                      {report.author.username}
                    </Text>
                  </Group>
                </td>
                <td>
                  <Group>
                    <Avatar
                      src={
                        report.user.avatarUri ||
                        `https://avatars.dicebear.com/api/identicon/${report.user.id}.png`
                      }
                      radius={999}
                      size={30}
                    />
                    <Text weight={500} color="dimmed" size="sm">
                      {report.user.username}
                    </Text>
                  </Group>
                </td>
                <td>{report.reason}</td>
                <td>{report.description}</td>
                <td>
                  <ActionIcon color="grape">
                    <HiArrowRight />
                  </ActionIcon>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false, true);
}

export default Admin;
