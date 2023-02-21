import {
  Avatar,
  Select,
  Skeleton,
  Text,
  TextInput,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { Team } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import Link from "next/link";
import React from "react";
import {
  HiCake,
  HiMap,
  HiSearch,
  HiSortAscending,
  HiUsers,
  HiViewGrid,
} from "react-icons/hi";
import Copy from "../../components/Copy";
import ModernEmptyState from "../../components/ModernEmptyState";
import RenderMarkdown from "../../components/RenderMarkdown";
import ShadedButton from "../../components/ShadedButton";
import ShadedCard from "../../components/ShadedCard";
import TeamsProvider from "../../components/Teams/Teams";
import UserContext from "../../components/UserContext";
import authorizedRoute from "../../util/auth";
import clsx from "../../util/clsx";
import getMediaUrl from "../../util/get-media";
import { NonUser, User } from "../../util/prisma-types";

type TeamsProps = {
  user: User;
};

type FilterType = "all" | "owner";
type SortType = "last_updated" | "created_at" | "members" | "name";
export type TeamType = {
  owner: NonUser;
  _count: {
    members: number;
    games: number;
  };
} & Team;

const Teams: React.FC<TeamsProps> = ({ user }) => {
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<FilterType>("all");
  const [sort, setSort] = React.useState<SortType>("name");
  const [teams, setTeams] = React.useState<TeamType[]>();
  const [loading, setLoading] = React.useState(true);
  const theme = useMantineTheme();

  const fetchTeams = async () => {
    setLoading(true);

    await fetch("/api/teams", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setTeams(res);
        setLoading(false);
      });
  };

  React.useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <TeamsProvider
      user={user}
      title="Teams"
      description="Manage your teams, collaborate, and organize your games."
    >
      <div
        className={clsx(
          "flex-initial flex-col md:flex-row flex items-center gap-4 mt-8",
          "items-stretch md:items-center mb-8"
        )}
      >
        <TextInput
          icon={<HiSearch />}
          placeholder="Search for a team"
          sx={{
            flex: "0 0 55%",
          }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <Select
          value={filter}
          onChange={(v) => {
            setFilter(v as FilterType);
          }}
          data={
            [
              { value: "all", label: "All" },
              { value: "owner", label: "Owner of" },
            ] as { value: FilterType; label: string }[]
          }
          placeholder="Filter..."
        />
        <Select
          icon={<HiSortAscending />}
          value={sort}
          onChange={(v) => {
            setSort(v as SortType);
          }}
          data={
            [
              { value: "name", label: "Name" },
              { value: "last_updated", label: "Last updated" },
              { value: "created_at", label: "Created at" },
              { value: "members", label: "Members" },
            ] as { value: SortType; label: string }[]
          }
          placeholder="Sort by..."
        />
      </div>
      <ShadedCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={220} />
            ))
          ) : teams && teams.length === 0 ? (
            <div className="w-full flex items-center justify-center">
              <ModernEmptyState
                title="No teams"
                body="You aren't apart of any teams yet. Why not make one to get started?"
              />
            </div>
          ) : (
            teams &&
            teams
              .filter((t) => {
                if (filter === "all") return true;
                return t.ownerId === user.id;
              })
              .sort((a, b) => {
                if (sort === "name") {
                  return a.name.localeCompare(b.name);
                } else if (sort === "last_updated") {
                  return (
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime()
                  );
                } else if (sort === "created_at") {
                  return (
                    new Date(b.cakeDay).getTime() -
                    new Date(a.cakeDay).getTime()
                  );
                } else if (sort === "members") {
                  return b._count.members + 1 - (a._count.members + 1);
                }
                return 0;
              })
              .filter((t) => {
                return t.name.toLowerCase().includes(search.toLowerCase());
              })
              .map((t) => (
                <Link href={`/teams/t/${t.slug}`} passHref key={t.id}>
                  <ShadedButton>
                    <div className="w-full">
                      <div className="flex gap-5 w-full items-start">
                        <Avatar src={getMediaUrl(t.iconUri)} size={82} />
                        <div className="flex-grow">
                          <div className="flex justify-between items-center">
                            <Text size="xl" weight={500}>
                              {t.name}
                            </Text>
                            <div className="flex items-center">
                              <Copy value={t.id} dontPropagate />
                              <Text size="sm" color="dimmed">
                                Copy ID
                              </Text>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mb-4">
                            <div className="mt-2 flex items-center gap-2">
                              <UserContext user={t.owner}>
                                <Avatar
                                  size={24}
                                  src={getMediaUrl(t.owner.avatarUri)}
                                  className="rounded-full"
                                />
                              </UserContext>
                              <Text size="sm" color="dimmed">
                                @{t.owner.username}
                              </Text>
                            </div>
                            <Tooltip label="Created on">
                              <div className="flex items-center gap-2">
                                <HiCake color={theme.colors.gray[4]} />
                                <Text size="sm" color="dimmed" weight={500}>
                                  {new Date(
                                    t.cakeDay as Date
                                  ).toLocaleDateString()}
                                </Text>
                              </div>
                            </Tooltip>
                          </div>
                          <RenderMarkdown clamp={2}>
                            {t.description}
                          </RenderMarkdown>
                        </div>
                      </div>
                      <div className="flex justify-around gap-2 mt-4">
                        {[
                          {
                            tooltip: "Member count",
                            value: t._count.members + 1 || 0,
                            icon: HiUsers,
                          },
                          {
                            tooltip: "Located",
                            value: t.location || "Unprovided",
                            icon: HiMap,
                          },
                          {
                            tooltip: "Game count",
                            value: t._count.games,
                            icon: HiViewGrid,
                          },
                        ].map(({ tooltip, value, icon: Icon }) => (
                          <Tooltip label={tooltip} key={tooltip}>
                            <div className="flex items-center gap-2">
                              <Icon color={theme.colors.gray[5]} />
                              <Text size="sm" color="dimmed" weight={500}>
                                {value}
                              </Text>
                            </div>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  </ShadedButton>
                </Link>
              ))
          )}
        </div>
      </ShadedCard>
    </TeamsProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await authorizedRoute(ctx, true, false);
};

export default Teams;
