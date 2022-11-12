import {
  Button,
  Divider,
  Grid,
  Group,
  Modal,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import {
  HiBell,
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
import Stateful from "../../Stateful";
import UserSelect from "../../UserSelect";
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

  const bulkNotificationForm = useForm<{
    title: string;
    message: string;
  }>({
    initialValues: {
      title: "",
      message: "",
    },
    validate: {
      title: (value) => {
        if (!value) return "Title is required";
      },
      message: (value) => {
        if (!value) return "Message is required";
      },
    },
  });

  const singleNotificationForm = useForm<{
    title: string;
    message: string;
    userid: number;
  }>({
    initialValues: {
      title: "",
      message: "",
      userid: 0,
    },
    validate: {
      title: (value) => {
        if (!value) return "Title is required";
      },
      message: (value) => {
        if (!value) return "Message is required";
      },
      userid: (value) => {
        if (!value) return "User ID is required";
      },
    },
  });

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

      <Group spacing={12}>
        <Button.Group>
          <Stateful>
            {(opened, setOpened) => (
              <>
                <Button leftIcon={<HiBell />} onClick={() => setOpened(true)}>
                  Send bulk notification
                </Button>

                <Modal
                  title="Send bulk notification"
                  opened={opened}
                  onClose={() => setOpened(false)}
                >
                  <Text mb={16}>
                    Send a notification to all users. This is useful for
                    announcing new features or updates.
                  </Text>

                  <form
                    onSubmit={bulkNotificationForm.onSubmit(
                      async (values) =>
                        await fetch("/api/admin/notifications/send/all", {
                          method: "POST",
                          headers: {
                            Authorization: String(
                              getCookie(".frameworksession")
                            ),
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify(values),
                        })
                          .then((res) => res.json())
                          .then((res) => {
                            if (res.error) {
                              bulkNotificationForm.setFieldError(
                                "message",
                                res.error
                              );
                            } else {
                              setOpened(false);
                            }
                          })
                    )}
                  >
                    <TextInput
                      label="Title"
                      description="Title of the notification"
                      mb={7}
                      {...bulkNotificationForm.getInputProps("title")}
                    />
                    <Textarea
                      label="Message"
                      description="Message of the notification"
                      mb={16}
                      {...bulkNotificationForm.getInputProps("message")}
                    />
                    <Button type="submit" fullWidth>
                      Send notifications
                    </Button>
                  </form>
                </Modal>
              </>
            )}
          </Stateful>
          <Stateful>
            {(opened, setOpened) => (
              <>
                <Button leftIcon={<HiBell />} onClick={() => setOpened(true)}>
                  Send notification
                </Button>

                <Modal
                  title="Send single notification"
                  opened={opened}
                  onClose={() => setOpened(false)}
                >
                  <Text mb={16}>
                    Send a notification to a single user. This is useful for
                    notifying a user about a report or a ban, or for sending
                    them a message.
                  </Text>

                  <form
                    onSubmit={singleNotificationForm.onSubmit(
                      async (values) =>
                        await fetch(
                          `/api/admin/notifications/send/${values.userid}`,
                          {
                            method: "POST",
                            headers: {
                              Authorization: String(
                                getCookie(".frameworksession")
                              ),
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              title: values.title,
                              message: values.message,
                            }),
                          }
                        )
                          .then((res) => res.json())
                          .then((res) => {
                            if (res.error) {
                              singleNotificationForm.setFieldError(
                                "message",
                                res.error
                              );
                            } else {
                              setOpened(false);
                            }
                          })
                    )}
                  >
                    <UserSelect
                      onUserSelect={(user) => {
                        singleNotificationForm.setFieldValue("userid", user.id);
                      }}
                      label="User"
                      description="User to send the notification to"
                      mb={7}
                      {...singleNotificationForm.getInputProps("userid")}
                    />
                    <TextInput
                      label="Title"
                      description="Title of the notification"
                      mb={7}
                      {...singleNotificationForm.getInputProps("title")}
                    />
                    <Textarea
                      label="Message"
                      description="Message of the notification"
                      mb={16}
                      {...singleNotificationForm.getInputProps("message")}
                    />
                    <Button type="submit" fullWidth>
                      Send notifications
                    </Button>
                  </form>
                </Modal>
              </>
            )}
          </Stateful>
        </Button.Group>
      </Group>

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
