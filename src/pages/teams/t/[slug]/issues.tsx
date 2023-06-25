import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Chip,
  Modal,
  Pagination,
  ScrollArea,
  Select,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { Rating, TeamIssue } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HiArrowRight,
  HiFilter,
  HiSearch,
  HiSortAscending,
} from "react-icons/hi";
import { TeamType } from "../..";
import LabelledCheckbox from "../../../../components/LabelledCheckbox";
import ModernEmptyState from "../../../../components/ModernEmptyState";
import RenderMarkdown from "../../../../components/RenderMarkdown";
import ShadedButton from "../../../../components/ShadedButton";
import ShadedCard from "../../../../components/ShadedCard";
import TeamsViewProvider from "../../../../components/Teams/TeamsView";
import authorizedRoute from "../../../../util/auth";
import clsx from "../../../../util/clsx";
import getMediaUrl from "../../../../util/get-media";
import { NonUser, User } from "../../../../util/prisma-types";
import { getTeam } from "../../../../util/teams";
import { tags } from "./issue/create";
import FilterIndicator from "../../../../components/FilterIndicator";

export type TeamViewIssuesProps = {
  user: User;
  team: TeamType & {
    games: {
      name: string;
      iconUri: string;
      _count: {
        likedBy: number;
        dislikedBy: number;
      };
      visits: number;
      author: NonUser;
      rating: Rating;
    }[];
  };
};

export type IssueFilter = "all" | "open" | "closed";
export type IssueSort = "title" | "date";
type Issue = TeamIssue & {
  game: {
    name: string;
    iconUri: string;
    id: number;
  };
  assignee: {
    id: number;
    username: string;
    avatarUri: string;
  };
  author: {
    id: number;
    username: string;
    avatarUri: string;
  };
};

const TeamViewIssues: React.FC<TeamViewIssuesProps> = ({ user, team }) => {
  const [search, setSearch] = useState("");
  const [issueFilter, setIssueFilter] = useState<IssueFilter>("all");
  const [issueSort, setServerSort] = useState<IssueSort>("title");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tagFilterModal, setTagFilterModal] = useState(false);

  const fetchIssues = async () => {
    setLoading(true);
    const res = await fetch(
      `/api/teams/${team.id}/issues?` +
        new URLSearchParams({
          search,
          filter: String(issueFilter),
          sort: String(issueSort),
          page: String(page),
          tags: JSON.stringify(tagFilter),
        }),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: String(getCookie(".frameworksession")),
        },
        method: "GET",
      }
    );

    const data = await res.json();
    setIssues(data.issues);
    setPages(data.pages);
    setLoading(false);
  };

  useEffect(() => {
    fetchIssues();
  }, [search, issueFilter, issueSort, page, tagFilter]);

  return (
    <TeamsViewProvider user={user} team={team} active="issues">
      <Modal
        title="Filter by tags"
        opened={tagFilterModal}
        onClose={() => setTagFilterModal(false)}
      >
        <Text size="sm" color="dimmed" mb="lg">
          Select tags to filter issues by to only show issues with the selected
          tags.
        </Text>
        <ShadedCard className="border-0">
          <ScrollArea sx={{ height: "15rem" }}>
            <Stack spacing="sm">
              {tags.map((tag) => (
                <LabelledCheckbox
                  key={tag.value}
                  label={tag.label}
                  checked={tagFilter.includes(tag.value)}
                  description={`Show issues with the ${tag.label} tag.`}
                  onChange={() => {
                    if (tagFilter.includes(tag.value)) {
                      setTagFilter(tagFilter.filter((t) => t !== tag.value));
                    } else {
                      setTagFilter([...tagFilter, tag.value]);
                    }
                  }}
                />
              ))}
            </Stack>
          </ScrollArea>
        </ShadedCard>
      </Modal>
      <div
        className={clsx(
          "flex-initial flex-col md:flex-row flex items-center gap-4",
          "items-stretch md:items-center"
        )}
      >
        <TextInput
          icon={<HiSearch />}
          placeholder="Search by title"
          sx={{
            flex: "0 0 45%",
          }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <Select
          value={issueFilter}
          onChange={(v) => {
            setIssueFilter(v as IssueFilter);
          }}
          data={
            [
              { value: "all", label: "All" },
              { value: "open", label: "Open" },
              { value: "closed", label: "Closed" },
            ] as { value: IssueFilter; label: string }[]
          }
          placeholder="Filter by status"
        />
        <Select
          icon={<HiSortAscending />}
          value={issueSort}
          onChange={(v) => {
            setServerSort(v as IssueSort);
          }}
          data={[
            { value: "title", label: "Title" },
            { value: "date", label: "Date" },
          ]}
          placeholder="Sort by"
        />
        <Tooltip label="Create new issue" position="bottom">
          <Link href={`/teams/t/${team.slug}/issue/create`} passHref>
            <ActionIcon
              className={clsx(
                "from-pink-500 to-purple-500 border-pink-500 bg-gradient-to-bl",
                "hidden md:flex md:items-center md:justify-center"
              )}
              size="lg"
              component="a"
            >
              <HiArrowRight />
            </ActionIcon>
          </Link>
        </Tooltip>
        <Link
          href={`/teams/t/${team.slug}/issue/create`}
          className="md:hidden"
          passHref
        >
          <Button
            variant="gradient"
            gradient={{
              from: "pink",
              to: "purple",
            }}
            className="md:hidden"
            component="a"
          >
            Create new issue
          </Button>
        </Link>
      </div>
      <div className="flex items-center gap-4 mt-6 mb-6">
        <Pagination
          radius="md"
          total={pages || 1}
          page={page}
          onChange={setPage}
        />
        <Chip
          classNames={{ label: "px-2" }}
          checked={false}
          onClick={() => {
            setTagFilterModal(true);
          }}
        >
          <div className="flex items-center gap-2">
            <HiFilter className="mx-1/2" />
            Filter by tags
          </div>
        </Chip>
        {tagFilter.length > 0 && (
          <FilterIndicator
            text={`${tagFilter.length} tags`}
            onClick={() => {
              setTagFilter([]);
            }}
          />
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <Skeleton height={100} key={i} />
          ))
        ) : issues.length > 0 ? (
          issues.map((issue) => (
            <Link
              href={`/teams/t/${team.slug}/issue/v/${issue.id}`}
              passHref
              key={issue.id}
            >
              <ShadedButton className="flex flex-col">
                <div className="flex items-center gap-4 mb-2">
                  <Tooltip
                    label={
                      issue.status === "OPEN"
                        ? "Open"
                        : issue.status === "CLOSED"
                        ? "Closed"
                        : "Duplicate"
                    }
                  >
                    <div className="relative flex h-3 w-3 items-center justify-center">
                      <div
                        className={clsx(
                          "w-3 h-3 rounded-full",
                          issue.status === "OPEN"
                            ? "bg-green-500/50"
                            : issue.status === "CLOSED"
                            ? "bg-red-500/50"
                            : "bg-yellow-500/50",
                          "animate-[issue-ping_1s_cubic-bezier(0,_0,_0.2,_1)_infinite] absolute"
                        )}
                      />
                      <div
                        className={clsx(
                          "w-3 h-3 rounded-full",
                          issue.status === "OPEN"
                            ? "bg-green-500"
                            : issue.status === "CLOSED"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                        )}
                      />
                    </div>
                  </Tooltip>
                  <Text size="xl" weight={500}>
                    {issue.title}
                  </Text>
                </div>
                <RenderMarkdown clamp={2} proseAddons="prose-sm">
                  {issue.content}
                </RenderMarkdown>
                <div className={clsx("flex flex-wrap gap-2 mt-2 mb-4")}>
                  {issue.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between w-full">
                  <Tooltip label="Author">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={getMediaUrl(issue.author.avatarUri)}
                        size={24}
                        radius={999}
                      />
                      <Text size="sm" weight={500}>
                        {issue.author.username}
                      </Text>
                    </div>
                  </Tooltip>
                  <Tooltip label="Assignee">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={getMediaUrl(issue.assignee.avatarUri)}
                        size={24}
                        radius={999}
                      />
                      <Text size="sm" weight={500}>
                        {issue.assignee.username}
                      </Text>
                    </div>
                  </Tooltip>
                </div>
              </ShadedButton>
            </Link>
          ))
        ) : (
          <ShadedCard className="items-center flex justify-center col-span-full">
            <ModernEmptyState
              title="No issues found"
              body="No issues found with the given filters. Try changing them."
            />
          </ShadedCard>
        )}
      </div>
    </TeamsViewProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const auth = await authorizedRoute(ctx, true, false);
  const slug = ctx.query.slug;
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

  return {
    props: {
      user: auth.props.user,
      team: JSON.parse(JSON.stringify(team)),
    },
  };
};

export default TeamViewIssues;
