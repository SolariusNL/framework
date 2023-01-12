import {
  Button,
  Drawer,
  RangeSlider,
  Select,
  Skeleton,
  TextInput,
} from "@mantine/core";
import { GameGenre } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from "next";
import React, { useEffect } from "react";
import { HiFilter, HiSearch } from "react-icons/hi";
import InfiniteScroll from "react-infinite-scroller";
import Descriptive from "../components/Descriptive";
import Framework from "../components/Framework";
import GameCard from "../components/GameCard";
import ModernEmptyState from "../components/ModernEmptyState";
import ShadedCard from "../components/ShadedCard";
import authorizedRoute from "../util/authorizedRoute";
import { getCookie } from "../util/cookies";
import { exclude } from "../util/exclude";
import prisma from "../util/prisma";
import { Game, gameSelect, User } from "../util/prisma-types";
import { genreMap } from "../util/universe/genre";

interface GamesProps {
  user: User;
  initialGames: Game[];
}

const Games: NextPage<GamesProps> = ({ user }) => {
  const [filter, setFilter] = React.useState({
    likes: "desc",
    dislikes: "asc",
    visits: "desc",
    genre: "",
    search: "",
    playerRange: [0, 50] as [number, number],
  });
  const [games, setGames] = React.useState<Game[]>();
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [canLoadMore, setCanLoadMore] = React.useState(true);
  const [filterOpen, setFilterOpen] = React.useState(false);

  const updateGames = async () => {
    setLoading(true);
    await fetch(
      `/api/games/${page}?${new URLSearchParams(
        Object.fromEntries(
          Object.entries(filter).filter(([, value]) => value != null)
        ) as Record<string, string>
      ).toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${getCookie(".frameworksession")}`,
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        setGames(res);
        setLoading(false);
      })
      .catch((err) => {
        alert(err + "\nPlease report this to Soodam.re");
      });
  };

  useEffect(() => {
    updateGames();
  }, [filter]);

  return (
    <>
      <Framework
        user={user}
        activeTab="games"
        modernTitle="Games"
        modernSubtitle="Browse the expansive library of games on Framework."
      >
        <Drawer
          title="Filter"
          opened={filterOpen}
          onClose={() => setFilterOpen(false)}
          zIndex={9999}
          padding="md"
        >
          <ShadedCard mb="md">
            <div className="flex items-center flex-col gap-4">
              <Select
                label="Likes filter"
                description="Filter for games with the most likes or the least likes."
                data={[
                  { label: "Most liked", value: "desc" },
                  { label: "Least liked", value: "asc" },
                ]}
                value={filter.likes}
                onChange={(v) => setFilter({ ...filter, likes: String(v) })}
                className="w-full"
              />
              <Select
                label="Dislikes filter"
                description="Filter for games with the most dislikes or the least dislikes."
                data={[
                  { label: "Most disliked", value: "desc" },
                  { label: "Least disliked", value: "asc" },
                ]}
                value={filter.dislikes}
                onChange={(v) => setFilter({ ...filter, dislikes: String(v) })}
                className="w-full"
              />
            </div>
          </ShadedCard>
          <ShadedCard>
            <div className="flex items-center flex-col gap-4">
              <Select
                label="Genre"
                description="Filter for games of a specific genre."
                data={Object.entries(genreMap).map(([key, value]) => ({
                  label: value,
                  value: key,
                }))}
                value={filter.genre}
                onChange={(v) =>
                  setFilter({ ...filter, genre: String(v) as GameGenre })
                }
                placeholder="Choose a genre"
                className="w-full"
              />
              <Descriptive
                title="Player range"
                description="Filter for games with a specific player range."
              >
                <RangeSlider min={0} max={50} />
              </Descriptive>
            </div>
          </ShadedCard>
        </Drawer>
        <ShadedCard className="flex gap-2 items-center mb-8">
          <TextInput
            icon={<HiSearch />}
            placeholder="Search for games"
            onChange={(e) =>
              setFilter({ ...filter, search: e.currentTarget.value })
            }
          />
          <Button
            variant="default"
            leftIcon={<HiFilter />}
            onClick={() => setFilterOpen(true)}
          >
            Filter...
          </Button>
        </ShadedCard>
        <ShadedCard>
          <InfiniteScroll
            loader={
              <div className="col-span-4" key={0}>
                <Skeleton height={200} />
              </div>
            }
            pageStart={1}
            loadMore={(p) => {
              fetch(`/api/games/${p}`, {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `${getCookie(".frameworksession")}`,
                },
              })
                .then((res) => res.json())
                .then((res) => {
                  if (res.length === 0) {
                    setCanLoadMore(false);
                  } else {
                    setGames([...(games ?? []), ...res]);
                  }

                  if (res === null) {
                    setCanLoadMore(false);
                  }
                })
                .catch((err) => {
                  alert(err + "\nPlease report this to Soodam.re");
                });
            }}
            hasMore={canLoadMore}
          >
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-6 gap-4 gap-y-8">
              {games &&
                games.length > 0 &&
                games.map((game) => <GameCard game={game} key={game.id} />)}
              {games && games.length == 0 && (
                <div className="col-span-full">
                  <ModernEmptyState
                    title="No games found"
                    body="Try switching up your filter."
                    shaded
                  />
                </div>
              )}
            </div>
          </InfiniteScroll>
        </ShadedCard>
      </Framework>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const auth = await authorizedRoute(context, true, false);
  const games = await prisma.game.findMany({
    orderBy: [
      {
        likedBy: {
          _count: "desc",
        },
      },
      { visits: "desc" },
    ],
    select: exclude(gameSelect, "comments"),
    take: 25,
  });

  if (auth.redirect) {
    return auth;
  }

  return {
    props: {
      user: auth.props.user ?? {},
      initialGames: JSON.parse(JSON.stringify(games)),
    },
  };
}

export default Games;
