import {
  Divider,
  Menu,
  NavLink,
  RangeSlider,
  Select,
  Skeleton,
  TextInput,
} from "@mantine/core";
import { GameGenre } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from "next";
import React, { useEffect } from "react";
import {
  HiClipboard,
  HiClock,
  HiFire,
  HiGift,
  HiSearch,
  HiSparkles,
} from "react-icons/hi";
import InfiniteScroll from "react-infinite-scroller";
import ContextMenu from "../components/ContextMenu";
import Descriptive from "../components/Descriptive";
import Framework from "../components/Framework";
import GameCard from "../components/GameCard";
import LabelledRadio from "../components/LabelledRadio";
import ModernEmptyState from "../components/ModernEmptyState";
import ShadedCard from "../components/ShadedCard";
import authorizedRoute from "../util/auth";
import { getCookie } from "../util/cookies";
import { exclude } from "../util/exclude";
import useMediaQuery from "../util/media-query";
import prisma from "../util/prisma";
import { Game, User, gameSelect } from "../util/prisma-types";
import { genreMap } from "../util/universe/genre";
import { BLACK } from "./teams/t/[slug]/issue/create";

interface GamesProps {
  user: User;
  initialGames: Game[];
}

const Games: NextPage<GamesProps> = ({ user }) => {
  const [filter, setFilter] = React.useState<{
    filter:
      | "most_liked"
      | "least_liked"
      | "most_disliked"
      | "least_disliked"
      | "oldest"
      | "newest"
      | "most_visited"
      | "least_visited"
      | string;
    genre: GameGenre | "";
    search: string;
    playerRange: [number, number];
    status: "online" | "offline" | "all";
  }>({
    filter: "most_liked",
    genre: "",
    search: "",
    playerRange: [0, 50] as [number, number],
    status: "all",
  });
  const [games, setGames] = React.useState<Game[]>();
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [canLoadMore, setCanLoadMore] = React.useState(true);
  const filterPresets = [
    {
      label: "Most popular",
      description: "Games filtered by most likes.",
      filter: {
        filter: "most_liked",
        genre: "",
        search: "",
        playerRange: [0, 50] as [number, number],
        status: "all",
      },
      icon: <HiSparkles />,
    },
    {
      label: "Hot",
      description: "Games filtered by most players.",
      filter: {
        filter: "most_visited",
        genre: "",
        search: "",
        playerRange: [20, 50] as [number, number],
        status: "all",
      },
      icon: <HiFire />,
    },
    {
      label: "New",
      description: "Games filtered by their creation date.",
      filter: {
        filter: "newest",
        genre: "",
        search: "",
        playerRange: [0, 50] as [number, number],
        status: "all",
      },
      icon: <HiGift />,
    },
    {
      label: "Throwback",
      description: "Throwback to old experiences.",
      filter: {
        filter: "oldest",
        genre: "",
        search: "",
        playerRange: [0, 50] as [number, number],
        status: "all",
      },
      icon: <HiClock />,
    },
  ];
  const [activeFilterPresetIndex, setActiveFilterPresetIndex] =
    React.useState(0);

  const updateGames = async () => {
    setLoading(true);
    await fetch(
      `/api/games/${page}?filter=${JSON.stringify(
        exclude(filter, ["playerRange"])
      )}`,
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
      });
  };

  useEffect(() => {
    updateGames();
  }, [filter]);

  const mobile = useMediaQuery("768");

  return (
    <>
      <Framework
        user={user}
        activeTab="games"
        modernTitle="Games"
        modernSubtitle="Browse the expansive library of games on Framework."
      >
        <div className="flex flex-col md:flex-row gap-8">
          <div {...(!mobile && { style: { width: 240 } })}>
            <div className="md:flex md:flex-col md:gap-2 flex-row grid grid-cols-2 gap-2 md:grid-cols-1 md:grid-rows-3">
              {filterPresets.map((preset, index) => (
                <NavLink
                  label={preset.label}
                  description={preset.description}
                  icon={preset.icon}
                  key={index}
                  active={activeFilterPresetIndex === index}
                  onClick={() => {
                    setActiveFilterPresetIndex(index);
                    setFilter(preset.filter as any);
                  }}
                  className="rounded-md"
                />
              ))}
            </div>
            <Divider mt="lg" mb="lg" />
            <div>
              <ShadedCard mb="md">
                <div className="flex items-center flex-col gap-4">
                  <Select
                    label="Filter"
                    description="Select a filter to sort games by, to find your next favorite game."
                    data={[
                      { label: "Most liked", value: "most_liked" },
                      { label: "Least liked", value: "least_liked" },
                      { label: "Most disliked", value: "most_disliked" },
                      { label: "Least disliked", value: "least_disliked" },
                      { label: "Oldest", value: "oldest" },
                      { label: "Newest", value: "newest" },
                      { label: "Most visited", value: "most_visited" },
                      { label: "Least visited", value: "least_visited" },
                    ]}
                    value={filter.filter}
                    onChange={(v) =>
                      setFilter({ ...filter, filter: String(v) })
                    }
                    className="w-full"
                    classNames={BLACK}
                  />
                  <Select
                    label="Genre"
                    description="Filter for games of a specific genre."
                    data={Object.entries(genreMap).map(([key, value]) => ({
                      label: value,
                      value: key,
                    }))}
                    value={filter.genre}
                    classNames={BLACK}
                    onChange={(v) =>
                      setFilter({ ...filter, genre: String(v) as GameGenre })
                    }
                    placeholder="Choose a genre"
                    className="w-full"
                  />
                  <Descriptive
                    title="Player range"
                    description="Filter for games with a specific player range."
                    className="w-full"
                  >
                    <RangeSlider
                      min={0}
                      max={50}
                      step={1}
                      value={filter.playerRange}
                      onChange={(v) => setFilter({ ...filter, playerRange: v })}
                    />
                  </Descriptive>
                  <Descriptive
                    title="Status"
                    description="Filter for games with a specific status."
                    className="w-full"
                  >
                    {[
                      {
                        label: "All",
                        value: "all",
                        description: "All games, regardless of status.",
                      },
                      {
                        label: "Online",
                        value: "online",
                        description: "Games that are online.",
                      },
                      {
                        label: "Offline",
                        value: "offline",
                        description:
                          "Games that are offline or do not have a server.",
                      },
                    ].map((status) => (
                      <LabelledRadio
                        label={status.label}
                        description={status.description}
                        value={status.value}
                        checked={filter.status === status.value}
                        onChange={(v) =>
                          setFilter({
                            ...filter,
                            status: v.target.value as
                              | "all"
                              | "online"
                              | "offline",
                          })
                        }
                        key={status.value}
                      />
                    ))}
                  </Descriptive>
                </div>
              </ShadedCard>
            </div>
          </div>
          <div className="flex-1">
            <ShadedCard>
              <TextInput
                icon={<HiSearch />}
                placeholder="Search for games"
                onChange={(e) =>
                  setFilter({ ...filter, search: e.currentTarget.value })
                }
                variant="unstyled"
                mb="lg"
              />
              <InfiniteScroll
                pageStart={1}
                loadMore={(p) => {
                  fetch(`/api/games/${p}?filter=${JSON.stringify(filter)}`, {
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
                    });
                }}
                hasMore={canLoadMore}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-8">
                  {games &&
                    games.length > 0 &&
                    games.map((game) => (
                      <ContextMenu
                        width={170}
                        key={game.id}
                        dropdown={
                          <>
                            <Menu.Item
                              icon={<HiClipboard />}
                              onClick={() => {
                                window.navigator.clipboard.writeText(
                                  `${window.location.origin}/game/${game.id}`
                                );
                              }}
                            >
                              Copy game ID
                            </Menu.Item>
                          </>
                        }
                      >
                        <GameCard game={game} />
                      </ContextMenu>
                    ))}
                  {games && games.length === 0 && (
                    <div className="col-span-full">
                      <ModernEmptyState
                        title="No games found"
                        body="Try switching up your filter."
                        shaded
                      />
                    </div>
                  )}
                  {!games &&
                    Array.from(Array(25).keys()).map((i) => (
                      <div className="flex flex-col gap-2" key={i}>
                        <Skeleton height={150} />
                        <Skeleton height={20} />
                        <Skeleton height={45} />
                      </div>
                    ))}
                </div>
              </InfiniteScroll>
            </ShadedCard>
          </div>
        </div>
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
    where: {
      private: false,
    },
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
