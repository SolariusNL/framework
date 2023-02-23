import { Select, Skeleton, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import React from "react";
import { HiSearch, HiSortAscending } from "react-icons/hi";
import InfiniteScroll from "react-infinite-scroller";
import { TeamType } from ".";
import ModernEmptyState from "../../components/ModernEmptyState";
import ShadedCard from "../../components/ShadedCard";
import TeamCard from "../../components/Teams/Team";
import TeamsProvider from "../../components/Teams/Teams";
import authorizedRoute from "../../util/auth";
import clsx from "../../util/clsx";
import { User } from "../../util/prisma-types";

type TeamsDiscoverProps = {
  user: User;
};

export type FilterType = "OPEN" | "PRIVATE" | "ALL";
export type SortType = "CREATED" | "MEMBERS" | "NAME" | "GAMES";

const TeamsDiscover: React.FC<TeamsDiscoverProps> = ({ user }) => {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch] = useDebouncedValue(search, 250);
  const [filter, setFilter] = React.useState<FilterType>("ALL");
  const [sort, setSort] = React.useState<SortType>("MEMBERS");
  const [teams, setTeams] = React.useState<TeamType[]>();
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [pages, setPages] = React.useState(1);
  const [canLoadMore, setCanLoadMore] = React.useState(true);

  const getTeamsApi = async (p: number) => {
    const res = await fetch(
      `/api/teams/discover/${p}?` +
        new URLSearchParams({ q: debouncedSearch, filter, sort }).toString(),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: String(getCookie(".frameworksession")),
        },
      }
    );
    return res.json();
  };

  React.useEffect(() => {
    setPage(1);
    setTeams([]);
    setLoading(true);
    getTeamsApi(1).then((res) => {
      setTeams(res.teams);
      setPages(res.pages);
      setCanLoadMore(res.teams.length > 0);
      setLoading(false);
    });
  }, [debouncedSearch, filter, sort]);

  return (
    <TeamsProvider
      user={user}
      title="Discover"
      description="Find new teams to join, and connect with other users."
    >
      <div
        className={clsx(
          "flex-initial flex-col md:flex-row flex items-center gap-4 mt-8",
          "items-stretch md:items-center mb-8"
        )}
      >
        <TextInput
          icon={<HiSearch />}
          placeholder="Search for teams"
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
              { value: "ALL", label: "All" },
              { value: "OPEN", label: "Open" },
              { value: "PRIVATE", label: "Private" },
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
              { value: "NAME", label: "Name" },
              { value: "CREATED", label: "Created at" },
              { value: "MEMBERS", label: "Members" },
              { value: "GAMES", label: "Games" },
            ] as { value: SortType; label: string }[]
          }
          placeholder="Sort by..."
        />
      </div>
      <ShadedCard>
        <InfiniteScroll
          pageStart={1}
          loadMore={async () => {
            if (page <= pages) {
              await getTeamsApi(page).then((res) => {
                setPage(page + 1);
                setTeams(teams ? [...teams, ...res.teams] : [...res.teams]);
                if (res.teams.length < 10) setCanLoadMore(false);

                setLoading(false);
              });
            }
          }}
          hasMore={canLoadMore}
          loader={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {page !== 1 &&
                Array(4)
                  .fill(0)
                  .map((_, i) => <Skeleton height={220} key={i} />)}
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {page === 1 && loading ? (
              <>
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton height={220} key={i} />
                  ))}
              </>
            ) : (
              <>
                {teams &&
                  teams
                    .filter(
                      (t, i, a) => a.findIndex((t2) => t2.id === t.id) === i
                    )
                    .map((t) => <TeamCard key={t.id} team={t} />)}
              </>
            )}
            {!canLoadMore && (
              <div className="flex items-center justify-center col-span-2">
                <ModernEmptyState
                  title="That's it"
                  body="We don't have any more teams to show you."
                />
              </div>
            )}
          </div>
        </InfiniteScroll>
      </ShadedCard>
    </TeamsProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await authorizedRoute(ctx, true, false);
};

export default TeamsDiscover;
