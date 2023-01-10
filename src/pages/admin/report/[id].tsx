import {
  Alert,
  Anchor,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { UserAdminNotes } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  HiArrowLeft,
  HiClock,
  HiDocument,
  HiShieldCheck,
  HiShieldExclamation,
  HiX,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import NoteTable, { NoteUser } from "../../../components/Admin/NoteTable";
import Punishment from "../../../components/Admin/Punishment";
import Framework from "../../../components/Framework";
import ModernEmptyState from "../../../components/ModernEmptyState";
import ShadedCard from "../../../components/ShadedCard";
import UserContext from "../../../components/UserContext";
import authorizedRoute from "../../../util/authorizedRoute";
import { exclude } from "../../../util/exclude";
import getMediaUrl from "../../../util/getMedia";
import prisma from "../../../util/prisma";
import {
  Game,
  gameSelect,
  nonCurrentUserSelect,
  NonUser,
  Report,
  User,
} from "../../../util/prisma-types";

interface ReportProps {
  user: User;
  report: Report & {
    author: {
      notes: UserAdminNotes &
        {
          author: NonUser;
          user: NonUser;
        }[];
    };
    user: {
      notes: UserAdminNotes &
        {
          author: NonUser;
          user: NonUser;
        }[];
    };
    game?: Game;
  };
}

const UserSection = ({
  user,
  hint,
}: {
  user: NonUser & {
    notes: {
      author: NonUser;
    };
  };
  hint: string;
}) => {
  return (
    <Group>
      <UserContext user={user}>
        <Avatar
          size={36}
          src={getMediaUrl(user.avatarUri)}
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

const ReportPage: NextPage<ReportProps> = ({ user, report }) => {
  const [punishOpened, setPunishOpened] = useState(false);
  const [punishUser, setPunishUser] = useState<NonUser | undefined>(undefined);
  const router = useRouter();

  const closeReport = async () => {
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
  };

  return (
    <>
      <Punishment
        user={punishUser as NonUser}
        setPunishOpened={setPunishOpened}
        punishOpened={punishOpened}
        onCompleted={() => {
          closeReport();
        }}
        reportAuthor={report.author.id}
      />

      <Framework activeTab="none" user={user}>
        <Grid columns={6} gutter="xl">
          <Grid.Col span={4}>
            <Group mb={12}>
              <Link href="/admin/reports">
                <Anchor sx={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <HiArrowLeft />
                  Back to reports
                </Anchor>
              </Link>
            </Group>
            <Title order={3} mb={24}>
              Report {report.id}{" "}
              {report.processed && (
                <Badge>
                  <HiShieldCheck /> Closed
                </Badge>
              )}
            </Title>

            <Grid mb={24}>
              <Grid.Col span={4}>
                <UserSection
                  user={exclude(report.author, ["notes"])}
                  hint="Author"
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <UserSection
                  user={exclude(report.user, ["notes"])}
                  hint="Reported"
                />
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

            <ShadedCard>
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
              <Text>{report.description}</Text>
              <Divider mt={32} mb={32} />
              {!report.game ? (
                <ModernEmptyState
                  title="No data"
                  body="This report has no data associated with it."
                />
              ) : (
                report.game && (
                  <Table striped>
                    <tbody>
                      {[
                        ["Game ID", report.game.id],
                        ["Name", report.game.name],
                        [
                          "Description",
                          report.game.description.replace(/(<([^>]+)>)/gi, ""),
                        ],
                        [
                          "Created",
                          new Date(report.game.createdAt).toLocaleDateString(),
                        ],
                        ["Icon URI", report.game.iconUri || "None"],
                        ["Likes", report.game.likedBy.length],
                        ["Dislikes", report.game.dislikedBy.length],
                        ["Visits", report.game.visits],
                        ["Playing", report.game.playing],
                        ["Rating", report.game.rating?.type || "None"],
                      ].map(([key, value]) => (
                        <tr key={key}>
                          <td className="whitespace-nowrap">{key}</td>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )
              )}
            </ShadedCard>
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
                onClick={() => {
                  closeReport();
                }}
              >
                Close report
              </Button>

              <ReactNoSSR>
                <ShadedCard withBorder shadow="md">
                  {[report.user, report.author].map((user) => (
                    <Card.Section withBorder p="md" key={user.id}>
                      <NoteTable user={user as unknown as NoteUser} />
                    </Card.Section>
                  ))}
                </ShadedCard>
              </ReactNoSSR>
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
    select: {
      user: {
        select: {
          ...nonCurrentUserSelect.select,
          notes: {
            select: {
              author: {
                select: {
                  ...nonCurrentUserSelect.select,
                },
              },
              content: true,
              createdAt: true,
              id: true,
            },
          },
        },
      },
      author: {
        select: {
          ...nonCurrentUserSelect.select,
          notes: {
            select: {
              author: {
                select: {
                  ...nonCurrentUserSelect.select,
                },
              },
              content: true,
              createdAt: true,
              id: true,
            },
          },
        },
      },
      description: true,
      id: true,
      reason: true,
      processed: true,
      createdAt: true,
      game: {
        select: gameSelect,
      },
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
