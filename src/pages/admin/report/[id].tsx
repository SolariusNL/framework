import NoteTable, { NoteUser } from "@/components/admin/note-table";
import Punish from "@/components/admin/pages/punish";
import Framework from "@/components/framework";
import InlineError from "@/components/inline-error";
import ModernEmptyState from "@/components/modern-empty-state";
import Owner from "@/components/owner";
import ShadedCard from "@/components/shaded-card";
import UserContext from "@/components/user-context";
import authorizedRoute from "@/util/auth";
import getMediaUrl from "@/util/get-media";
import prisma from "@/util/prisma";
import {
  Game,
  NonUser,
  Report,
  User,
  gameSelect,
  nonCurrentUserSelect,
} from "@/util/prisma-types";
import {
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
  HiOutlineClock,
  HiOutlineTag,
  HiOutlineUser,
  HiOutlineXCircle,
  HiShieldCheck,
  HiX,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";

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
      <Framework activeTab="none" user={user}>
        {punishOpened ? (
          <Punish
            reporterId={report.author.id}
            userId={punishUser?.id}
            back={{
              label: "Back to report",
              onClick: () => {
                setPunishOpened(false);
              },
            }}
            onComplete={closeReport}
          />
        ) : (
          <Grid columns={6} gutter="xl">
            <Grid.Col span={4}>
              <Group mb={12}>
                <Link href="/admin/reports">
                  <Button
                    leftIcon={<HiArrowLeft />}
                    radius="xl"
                    variant="light"
                  >
                    Back to reports
                  </Button>
                </Link>
              </Group>
              <Title order={3} mb={24}>
                Report {report.id.split("-")[0]}{" "}
                {report.processed && (
                  <Badge>
                    <HiShieldCheck /> Closed
                  </Badge>
                )}
              </Title>

              <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-2 gap-4">
                {[
                  {
                    label: "Created",
                    icon: <HiOutlineClock />,
                    value: new Date(report.createdAt).toLocaleDateString(),
                  },
                  {
                    label: "Status",
                    icon: <HiOutlineTag />,
                    value: report.processed === true ? "Closed" : "Opened",
                  },
                  {
                    label: "Author",
                    icon: <HiOutlineUser />,
                    value: <Owner user={report.user} size={30} />,
                  },
                ]
                  .filter((x) => x.value)
                  .map((x) => (
                    <div className="flex items-center gap-4" key={x.label}>
                      <ThemeIcon color="blue" size={36} radius={99}>
                        {x.icon}
                      </ThemeIcon>
                      <Stack spacing={3}>
                        <Text color="dimmed" size="sm">
                          {x.label}
                        </Text>
                        <Text weight={500}>{x.value}</Text>
                      </Stack>
                    </div>
                  ))}
              </div>

              {report.description.length < 30 && (
                <InlineError
                  title="Short description"
                  className="my-8"
                  variant="warning"
                >
                  This report has a short description. This could mean that this
                  report is not genuine. Please review the report carefully.
                </InlineError>
              )}

              <Title order={3} mb="sm">
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
            </Grid.Col>
            <Grid.Col span={2}>
              <Text size="sm" color="dimmed" weight={500} mb={6}>
                Actions
              </Text>
              <Stack spacing={8} mb={16}>
                <Button
                  color="red"
                  leftIcon={<HiOutlineXCircle />}
                  onClick={() => {
                    setPunishUser(report.author);
                    setPunishOpened(true);
                  }}
                  fullWidth
                  disabled={report.processed}
                  radius="xl"
                  variant="light"
                >
                  Punish author
                </Button>
                <Button
                  color="red"
                  leftIcon={<HiOutlineXCircle />}
                  onClick={() => {
                    setPunishUser(report.user);
                    setPunishOpened(true);
                  }}
                  fullWidth
                  disabled={report.processed}
                  radius="xl"
                  variant="light"
                >
                  Punish reported
                </Button>

                <Button
                  variant="light"
                  leftIcon={<HiX />}
                  disabled={report.processed}
                  fullWidth
                  onClick={() => {
                    closeReport();
                  }}
                  mt="md"
                  radius="xl"
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
        )}
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
