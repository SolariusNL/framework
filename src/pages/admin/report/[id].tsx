import {
  Alert,
  Anchor,
  Avatar,
  Badge,
  Button,
  Grid,
  Group,
  Modal,
  Paper,
  Select,
  Spoiler,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  HiClock,
  HiDocument,
  HiShieldCheck,
  HiShieldExclamation,
  HiX,
} from "react-icons/hi";
import Framework from "../../../components/Framework";
import UserContext from "../../../components/UserContext";
import authorizedRoute from "../../../util/authorizedRoute";
import prisma from "../../../util/prisma";
import {
  nonCurrentUserSelect,
  NonUser,
  Report,
  User,
} from "../../../util/prisma-types";

interface ReportProps {
  user: User;
  report: Report;
}

const UserSection = ({ user, hint }: { user: NonUser; hint: string }) => {
  return (
    <Group>
      <UserContext user={user}>
        <Avatar
          size={36}
          src={user.avatarUri}
          alt={user.username}
          radius={99}
        />
      </UserContext>
      <Stack spacing={3}>
        <Text size="sm" color="dimmed">
          {hint}
        </Text>
        <Text weight={650}>{user.username}</Text>
      </Stack>
    </Group>
  );
};

interface IPunishmentForm {
  category: "warning" | "ban";
  reason: string;
}

const ReportPage: NextPage<ReportProps> = ({ user, report }) => {
  const [punishOpened, setPunishOpened] = useState(false);
  const [punishUser, setPunishUser] = useState<NonUser | undefined>(undefined);

  const router = useRouter();

  const punishmentForm = useForm<IPunishmentForm>({
    initialValues: {
      category: "warning",
      reason: "",
    },
    validate: {
      reason: (value) => {
        if (value.length < 10) {
          return "Reason must be at least 10 characters long";
        }
      },
    },
  });

  const submitPunishment = async (values: IPunishmentForm) => {
    await fetch(
      `/api/admin/report/${report.id}/punish/${
        punishUser?.id === report.authorId ? "author" : "reported"
      }`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: String(getCookie(".frameworksession")),
        },
        body: JSON.stringify({
          category: values.category,
          description: values.reason,
        }),
      }
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          router.reload();
        } else {
          alert("An error occurred while punishing the user.");
        }
      })
      .catch(() => {
        alert("An error occurred while punishing the user.");
      });
  };

  return (
    <>
      <Modal
        title="Punishment"
        opened={punishOpened}
        onClose={() => setPunishOpened(false)}
      >
        <Group mb={24}>
          <Group>
            <Avatar size={36} src={punishUser?.avatarUri} radius={99} />
            <Stack spacing={3}>
              <Text size="sm" color="dimmed">
                Receiving punishment
              </Text>
              <Text weight={650}>{punishUser?.username}</Text>
            </Stack>
          </Group>
        </Group>

        <form onSubmit={punishmentForm.onSubmit(submitPunishment)}>
          <Stack spacing={8} mb={24}>
            <Select
              label="Category"
              description="Select punishment category"
              data={[
                { label: "Warning", value: "warning" },
                { label: "Ban", value: "ban" },
              ]}
              {...punishmentForm.getInputProps("category")}
            />

            <Textarea
              label="Reason"
              description="Explain the punishment"
              {...punishmentForm.getInputProps("reason")}
            />
          </Stack>

          <Button fullWidth type="submit" leftIcon={<HiShieldCheck />}>
            Punish
          </Button>
        </form>
      </Modal>

      <Framework activeTab="none" user={user}>
        <Grid columns={6} gutter="xl">
          <Grid.Col span={4}>
            <Title order={3} mb={24}>
              Report {report.id}{" "}
              {report.processed && (
                <Badge>
                  <HiShieldCheck /> Processed
                </Badge>
              )}
            </Title>

            <Grid mb={24}>
              <Grid.Col span={4}>
                <UserSection user={report.author} hint="Author" />
              </Grid.Col>
              <Grid.Col span={4}>
                <UserSection user={report.user} hint="Reported" />
              </Grid.Col>
              <Grid.Col span={4}>
                <Group>
                  <ThemeIcon color="blue" size={36} radius={99}>
                    <HiClock />
                  </ThemeIcon>
                  <Stack spacing={3}>
                    <Text size="md" color="dimmed">
                      Created
                    </Text>
                    <Text weight={500}>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </Text>
                  </Stack>
                </Group>
              </Grid.Col>
            </Grid>

            {report.description.length < 30 && (
              <Alert
                icon={<HiShieldExclamation size={24} />}
                color="orange"
                title="Potential spam"
                mb={24}
              >
                This warning is shown because the report description is less
                than 30 characters. This is a potential sign of spam. If you
                believe this is a mistake, please contact an HR.
              </Alert>
            )}

            <Title order={4} mb={10}>
              {report.reason}
            </Title>
            <Text mb={24}>{report.description}</Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" color="dimmed" weight={500} mb={6}>
              Actions
            </Text>
            <Stack spacing={8} mb={16}>
              <Button.Group orientation="vertical">
                <Button
                  color="red"
                  leftIcon={<HiDocument />}
                  onClick={() => {
                    setPunishUser(report.author);
                    setPunishOpened(true);
                  }}
                  fullWidth
                  disabled={report.processed}
                >
                  Punish author
                </Button>
                <Button
                  color="red"
                  leftIcon={<HiDocument />}
                  onClick={() => {
                    setPunishUser(report.user);
                    setPunishOpened(true);
                  }}
                  fullWidth
                  disabled={report.processed}
                >
                  Punish reported
                </Button>
              </Button.Group>

              <Button
                variant="light"
                leftIcon={<HiX />}
                disabled={report.processed}
                fullWidth
                onClick={async () => {
                  await fetch(`/api/admin/report/${report.id}/close`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: String(getCookie(".frameworksession")),
                    },
                  })
                    .then((res) => res.json())
                    .then((res) => {
                      if (res.success) {
                        router.reload();
                      } else {
                        alert("An error occurred while closing the report.");
                      }
                    })
                    .catch(() => {
                      alert("An error occurred while closing the report.");
                    });
                }}
              >
                Close report
              </Button>
            </Stack>
          </Grid.Col>
        </Grid>
      </Framework>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.query;
  const auth = await authorizedRoute(context, true, false, true);

  if (auth.redirect) {
    return auth;
  }

  const report = await prisma.userReport.findFirst({
    where: {
      id: String(id),
    },
    include: {
      user: nonCurrentUserSelect,
      author: nonCurrentUserSelect,
    },
  });

  return {
    props: {
      report: JSON.parse(JSON.stringify(report)),
      user: auth.props.user,
    },
  };
}

export default ReportPage;
