import Owner from "@/components/Owner";
import DataGrid from "@/components/data-grid";
import Markdown from "@/components/markdown";
import ModernEmptyState from "@/components/modern-empty-state";
import ShadedCard from "@/components/shaded-card";
import TeamsViewProvider from "@/components/teams/teams-view";
import { TeamType } from "@/pages/teams";
import authorizedRoute from "@/util/auth";
import clsx from "@/util/clsx";
import getMediaUrl from "@/util/get-media";
import prisma from "@/util/prisma";
import { NonUser, User, nonCurrentUserSelect } from "@/util/prisma-types";
import { getTeam } from "@/util/teams";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Button,
  Divider,
  Modal,
  Select,
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
  HiExclamation,
  HiOutlineCube,
  HiOutlineDesktopComputer,
  HiOutlineUser,
  HiX,
} from "react-icons/hi";
import RenderMarkdo@/components/ownernts/RenderMarkdown";

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
      <DataGrid
        items={[
          {
            icon: <HiOutlineUser />,
            tooltip: "Assignee",
            value: <Owner user={issueState.assignee} />,
          },
          {
            icon: <HiOutlineDesktopComputer />,
            tooltip: "Environment",
            value: <Badge>{issueState.environment}</Badge>,
          },
          {
            icon: <HiOutlineCube />,
            tooltip: "Game",
            value: (
              <Link href={`/game/${issueState.game.id}`} passHref>
                <div className="flex items-center gap-2 cursor-pointer">
                  <Avatar
                    size={24}
                    src={getMediaUrl(issueState.game.iconUri)}
                  />
                  <Anchor size="sm">{issueState.game.name}</Anchor>
                </div>
              </Link>
            ),
          },
        ]}
      />
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
