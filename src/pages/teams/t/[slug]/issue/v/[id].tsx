import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Divider,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { TeamIssue } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useState } from "react";
import {
  HiArrowLeft,
  HiChat,
  HiCheck,
  HiCheckCircle,
  HiCube,
  HiExclamation,
  HiOutlineDesktopComputer,
  HiUser,
  HiX,
} from "react-icons/hi";
import { TeamType } from "../../../..";
import Markdown from "../../../../../../components/Markdown";
import ModernEmptyState from "../../../../../../components/ModernEmptyState";
import Owner from "../../../../../../components/Owner";
import RenderMarkdown from "../../../../../../components/RenderMarkdown";
import ShadedCard from "../../../../../../components/ShadedCard";
import TeamsViewProvider from "../../../../../../components/Teams/TeamsView";
import authorizedRoute from "../../../../../../util/auth";
import clsx from "../../../../../../util/clsx";
import getMediaUrl from "../../../../../../util/get-media";
import prisma from "../../../../../../util/prisma";
import {
  NonUser,
  User,
  nonCurrentUserSelect,
} from "../../../../../../util/prisma-types";
import { getTeam } from "../../../../../../util/teams";

export type TeamIssueViewProps = {
  user: User;
  team: TeamType;
  issue: TeamIssue & {
    assignee: NonUser;
    author: NonUser;
    game: {
      name: string;
      iconUri: string;
      id: number;
    };
  };
};

type Editable = "title" | "contentMd" | "status";

const TeamIssueView: React.FC<TeamIssueViewProps> = ({ user, team, issue }) => {
  const [issueState, setIssueState] = useState(issue);
  const [editing, setEditing] = useState<{
    [key in Editable]?: boolean;
  }>({});
  const [edits, setEdits] = useState<{
    [key in Editable]?: string;
  }>({
    title: issueState.title,
    contentMd: issueState.contentMd,
    status: issueState.status,
  });

  const setEditable = (key: Editable, value: boolean) => {
    setEditing((e) => ({ ...e, [key]: value }));
  };

  const isEditable = (key: Editable) => {
    return editing[key] === true;
  };

  const setEdit = (key: Editable, value: string) => {
    setEdits((e) => ({ ...e, [key]: value }));
  };

  const saveEdits = async () => {
    const req = await fetch(
      `/api/teams/${team.id}/issue/${issueState.id}/edit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: String(getCookie(".frameworksession")),
        },
        body: JSON.stringify(edits),
      }
    );
    const res = await req.json();
    if (res.error) {
      showNotification({
        title: "Error",
        message: res.error || "An error occurred.",
        icon: <HiExclamation />,
      });
      return;
    }
    setIssueState((i) => ({ ...i, ...res.issue }));
    showNotification({
      title: "Issue updated",
      message: "Your issue has been updated.",
      icon: <HiCheckCircle />,
    });
  };

  return (
    <TeamsViewProvider user={user} team={team} active="issues">
      <Modal
        opened={isEditable("status")}
        onClose={() => setEditable("status", false)}
        title="Change status"
      >
        <Text size="sm" color="dimmed" mb="md">
          Change the status of this issue.
        </Text>
        <Select
          data={[
            { label: "Open", value: "OPEN" },
            { label: "Closed", value: "CLOSED" },
            { label: "Duplicate", value: "DUPLICATE" },
          ]}
          value={edits.status}
          onChange={(v) => setEdit("status", String(v))}
        />
        <div className="flex justify-end mt-4 gap-2">
          <Button
            onClick={() => {
              setEditable("status", false);
            }}
            variant="default"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              saveEdits();
              setEditable("status", false);
            }}
            leftIcon={<HiCheck />}
          >
            Save
          </Button>
        </div>
      </Modal>
      <div className="flex items-start gap-4 mb-6">
        <Link href={`/teams/t/${team.slug}/issues`} passHref>
          <ActionIcon
            size="xl"
            className="rounded-full hover:border-zinc-500/50 transition-all"
            sx={{
              borderWidth: 1,
            }}
            component="a"
          >
            <HiArrowLeft />
          </ActionIcon>
        </Link>
        <div className="w-full flex justify-between items-start flex-col md:flex-row gap-y-6 md:gap-y-0">
          <div className="flex flex-col gap-4 md:mt-2 w-[80%]">
            {isEditable("title") ? (
              <div className="flex items-center gap-2">
                <TextInput
                  classNames={{
                    input: "dark:bg-black dark:text-white",
                    root: "!w-[65%]",
                  }}
                  value={edits.title}
                  onChange={(e) => setEdit("title", e.target.value)}
                  mr="xs"
                />
                <ActionIcon
                  color="gray"
                  variant="light"
                  onClick={() => setEditable("title", false)}
                >
                  <HiX />
                </ActionIcon>
                <ActionIcon
                  color="teal"
                  variant="light"
                  onClick={() => {
                    saveEdits();
                    setEditable("title", false);
                  }}
                >
                  <HiCheck />
                </ActionIcon>
              </div>
            ) : (
              <Title
                order={3}
                className={clsx(
                  user.id === team.ownerId || user.id === issueState.authorId
                    ? "cursor-pointer"
                    : ""
                )}
                onClick={() => {
                  if (
                    user.id !== team.ownerId &&
                    user.id !== issueState.authorId
                  )
                    return;
                  setEditable("title", true);
                }}
              >
                {issueState.title}
              </Title>
            )}
            <Owner user={issueState.author} />
          </div>
          <Badge
            color={
              issueState.status === "OPEN"
                ? "teal"
                : issueState.status === "CLOSED"
                ? "red"
                : "yellow"
            }
            size="lg"
            radius="md"
            className={clsx(
              "mt-2",
              user.id === team.ownerId || user.id === issueState.authorId
                ? "cursor-pointer"
                : ""
            )}
            onClick={() => {
              if (user.id !== team.ownerId && user.id !== issueState.authorId)
                return;
              setEditable("status", true);
            }}
          >
            {issueState.status}
          </Badge>
        </div>
      </div>
      <ShadedCard>
        {isEditable("contentMd") ? (
          <>
            <Markdown
              value={edits.contentMd}
              onChange={(v) => setEdit("contentMd", v)}
            />
            <div className="flex justify-end mt-4 gap-2">
              <Button
                onClick={() => {
                  setEditable("contentMd", false);
                }}
                variant="default"
              >
                Cancel
              </Button>
              <Button
                leftIcon={<HiCheck />}
                onClick={() => {
                  setEditable("contentMd", false);
                  saveEdits();
                }}
              >
                Save
              </Button>
            </div>
          </>
        ) : (
          <RenderMarkdown
            className={clsx(
              user.id === team.ownerId || user.id === issueState.authorId
                ? "cursor-pointer"
                : ""
            )}
            onClick={() => {
              if (user.id !== team.ownerId && user.id !== issueState.authorId)
                return;
              setEditable("contentMd", true);
            }}
            proseAddons="break-words"
          >
            {issueState.content}
          </RenderMarkdown>
        )}
        <div className="mt-4 flex flex-wrap gap-1">
          {issueState.tags.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
      </ShadedCard>
      <div
        className={clsx(
          "mt-6 grid grid-cols-2 content-center md:grid-cols-3 gap-4"
        )}
      >
        {[
          {
            icon: <HiUser />,
            label: "Assignee",
            item: <Owner user={issueState.assignee} />,
          },
          {
            icon: <HiOutlineDesktopComputer />,
            label: "Environment",
            item: <Badge>{issueState.environment}</Badge>,
          },
          {
            icon: <HiCube />,
            label: "Game",
            item: (
              <Link href={`/game/${issueState.game.id}`} passHref>
                <div className="flex items-center gap-2 cursor-pointer">
                  <Avatar
                    size={24}
                    src={getMediaUrl(issueState.game.iconUri)}
                  />
                  <Text color="dimmed" size="sm">
                    {issueState.game.name}
                  </Text>
                </div>
              </Link>
            ),
          },
        ].map((x, i) => (
          <div key={i} className="mb-4">
            <Stack spacing={10} align="center">
              {x.icon}
              <Text weight={550} mb={6}>
                {x.label}
              </Text>
              {typeof x.item === "string" ? (
                <Text>{x.item}</Text>
              ) : (
                <div>{x.item}</div>
              )}
            </Stack>
          </div>
        ))}
      </div>
      <Divider mt="lg" mb="lg" />
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <Title order={4}>Comments</Title>
          <Text weight={700} color="dimmed">
            0
          </Text>
        </div>
        <Button leftIcon={<HiChat />}>New comment</Button>
      </div>
      <ShadedCard mt="md">
        <div className="flex items-center justify-center">
          <ModernEmptyState
            title="Unavailable"
            body="Comments are currently unavailable."
          />
        </div>
      </ShadedCard>
    </TeamsViewProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const auth = await authorizedRoute(ctx, true, false);
  const slug = ctx.query.slug;
  const id = ctx.query.id;
  const team = await getTeam(String(slug));

  if (auth.redirect) return auth;

  if (!team) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }

  const issue = await prisma.teamIssue.findFirst({
    where: {
      id: String(id),
      teamId: team.id,
    },
    include: {
      assignee: nonCurrentUserSelect,
      author: nonCurrentUserSelect,
      game: {
        select: {
          name: true,
          iconUri: true,
          id: true,
        },
      },
    },
  });

  return {
    props: {
      user: auth.props.user,
      team: JSON.parse(JSON.stringify(team)),
      issue: JSON.parse(JSON.stringify(issue)),
    },
  };
};

export default TeamIssueView;
