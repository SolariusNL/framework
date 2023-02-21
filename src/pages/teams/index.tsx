import {
  ActionIcon,
  Avatar,
  Menu,
  Select,
  Skeleton,
  Text,
  TextInput,
} from "@mantine/core";
import { Team } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import Link from "next/link";
import React from "react";
import {
  HiClipboard,
  HiDotsVertical,
  HiExternalLink,
  HiPencil,
  HiSearch,
  HiSortAscending,
} from "react-icons/hi";
import Copy from "../../components/Copy";
import ModernEmptyState from "../../components/ModernEmptyState";
import ShadedButton from "../../components/ShadedButton";
import ShadedCard from "../../components/ShadedCard";
import TeamsProvider from "../../components/Teams/Teams";
import authorizedRoute from "../../util/auth";
import clsx from "../../util/clsx";
import getMediaUrl from "../../util/get-media";
import { NonUser, User } from "../../util/prisma-types";

type TeamsProps = {
  user: User;
};

type FilterType = "all" | "owner";
type SortType = "last_updated" | "created_at" | "members" | "name";
type TeamType = {
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
            teams.map((t) => (
              <Link href={`/teams/${t.name}`} passHref key={t.id}>
                <ShadedButton>
                  <div className="w-full flex flex-row">
                    <div className="flex gap-5 w-full">
                      <Avatar src={getMediaUrl(t.iconUri)} size={82} />
                      <div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
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
                          <Menu>
                            <Menu.Target>
                              <ActionIcon onClick={(e) => e.stopPropagation()}>
                                <HiDotsVertical />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Link href={`/teams/${t.name}/edit`} passHref>
                                <Menu.Item icon={<HiPencil />} component="a">
                                  Edit team
                                </Menu.Item>
                              </Link>
                              <Link href={`/teams/${t.name}`} passHref>
                                <Menu.Item
                                  icon={<HiExternalLink />}
                                  component="a"
                                >
                                  View team
                                </Menu.Item>
                              </Link>
                              <Menu.Divider />
                              <Menu.Item icon={<HiClipboard />}>
                                Copy ID
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </div>
                      </div>
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
