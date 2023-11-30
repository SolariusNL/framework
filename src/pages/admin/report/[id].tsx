import Framework from "@/components/framework";
import InlineError from "@/components/inline-error";
import ModernEmptyState from "@/components/modern-empty-state";
import Owner from "@/components/owner";
import ShadedCard from "@/components/shaded-card";
import UserContext from "@/components/user-context";
import authorizedRoute from "@/util/auth";
import clsx from "@/util/clsx";
import getMediaUrl from "@/util/get-media";
import prisma from "@/util/prisma";
import {
  Game,
  NonUser,
  Report,
  User,
  nonCurrentUserSelect,
} from "@/util/prisma-types";
import {
  Anchor,
  Avatar,
  Button,
  Divider,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { UserAdminNotes, UserReportState } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  HiArrowLeft,
  HiOutlineClock,
  HiOutlineLink,
  HiOutlineTag,
  HiOutlineUser,
  HiOutlineXCircle,
  HiX,
} from "react-icons/hi";

const Punish = dynamic(() => import("@/components/admin/pages/punish"));

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

  const closeReport = async (punished: boolean) => {
    await fetch(`/api/admin/report/${report.id}/close`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        state: punished
          ? UserReportState.VIOLATIONS_FOUND
          : UserReportState.NO_VIOLATIONS,
      }),
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
            onComplete={() => closeReport(true)}
          />
        ) : (
          <div className="flex md:flex-row flex-col md:gap-4 gap-12">
            <div className="md:w-[2/3] md:flex-[2]">
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
              <div className="flex items-center gap-4">
                <Title
                  order={3}
                  className={clsx(
                    report.processed && "line-through text-dimmed"
                  )}
                >
                  Report {report.id.split("-")[0]}
                </Title>
                <Divider className="flex-grow" />
              </div>
              <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-2 my-8 gap-4">
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
                    value: (
                      <Link href={`/profile/${report.author.username}`}>
                        <Anchor>@{report.author.username}</Anchor>
                      </Link>
                    ),
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
              <div className="flex gap-2 items-center mb-4">
                <Text size="sm" weight={500} color="dimmed">
                  Report details
                </Text>
                <Divider className={clsx("flex-grow")} />
              </div>
              {report.description.length < 30 && (
                <InlineError
                  title="Short description"
                  className="mb-6 mt-2"
                  variant="warning"
                >
                  The briefness of this report&apos;s description might suggest
                  it&apos;s not genuine. Please take a close look at the report.
                </InlineError>
              )}
              <div className="flex flex-col gap-4 mb-4">
                {[
                  {
                    label: "Report category",
                    value: report.reason,
                    icon: <HiOutlineTag />,
                  },
                  {
                    label: "Reported user",
                    value: <Owner user={report.user} />,
                    icon: <HiOutlineUser />,
                  },
                ].map((x) => (
                  <div
                    className="flex gap-2 items-start md:flex-row flex-col"
                    key={x.label}
                  >
                    <Text
                      weight={500}
                      size="sm"
                      color="dimmed"
                      className="flex items-center gap-2 flex-shrink-0 md:w-[25%] w-full"
                    >
                      {x.icon}
                      {x.label}
                    </Text>
                    <Text
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      className="md:max-w-[75%] max-w-full"
                      size="sm"
                    >
                      {x.value}
                    </Text>
                  </div>
                ))}
              </div>
              <Text>{report.description}</Text>
              <div className="flex flex-col gap-1 mt-8">
                <div className="flex gap-2 items-center mb-2">
                  <Text size="sm" weight={500} color="dimmed">
                    Attached links
                  </Text>
                  <Divider className={clsx("flex-grow")} />
                </div>
                {report.links.length === 0 ? (
                  <ShadedCard>
                    <ModernEmptyState
                      title="No links"
                      body="No links were attached to this report."
                    />
                  </ShadedCard>
                ) : (
                  report.links.map((link) => (
                    <Anchor
                      className="flex items-center gap-2 w-fit"
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={link}
                    >
                      <HiOutlineLink />
                      {link}
                    </Anchor>
                  ))
                )}
              </div>
            </div>
            <div className="md:w-[1/3] md:flex-1">
              <div className="flex gap-2 items-center mb-2">
                <Text size="sm" weight={500} color="dimmed">
                  Report details
                </Text>
                <Divider className={clsx("flex-grow")} />
              </div>
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
                    closeReport(false);
                  }}
                  mt="md"
                  radius="xl"
                >
                  Close report
                </Button>
              </Stack>
            </div>
          </div>
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
