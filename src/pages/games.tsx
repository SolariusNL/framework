import {
  Button,
  Grid,
  Group,
  MultiSelect,
  Stack,
  TextInput,
} from "@mantine/core";
import { GameGenre } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from "next";
import React from "react";
import { HiFilter, HiSearch } from "react-icons/hi";
import AscDescFilter from "../components/Filter/AscDescFilter";
import Framework from "../components/Framework";
import GameCard from "../components/GameCard";
import ModernEmptyState from "../components/ModernEmptyState";
import ShadedCard from "../components/ShadedCard";
import authorizedRoute from "../util/authorizedRoute";
import { getCookie } from "../util/cookies";
import prisma from "../util/prisma";
import { Game, gameSelect, User } from "../util/prisma-types";
import { genreMap } from "../util/universe/genre";
import useMediaQuery from "../util/useMediaQuery";

interface GamesProps {
  user: User;
  initialGames: Game[];
}

interface GameFilter {
  likes: "desc" | "asc";
  dislikes: "desc" | "asc";
  visits: "desc" | "asc";
  genres: GameGenre[] | null;
}

const Games: NextPage<GamesProps> = ({ user, initialGames }) => {
  const mobile = useMediaQuery("768");
  const [filter, setFilter] = React.useState<GameFilter>({
    likes: "desc",
    dislikes: "asc",
    visits: "desc",
    genres: null,
  });
  const [games, setGames] = React.useState<Game[]>(initialGames);
  const [loading, setLoading] = React.useState(false);

  const updateGames = async () => {
    setLoading(true);
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(filter)) {
      if (value) {
        params.append(key, value);
      }
    }

    await fetch(`/api/games/1?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${getCookie(".frameworksession")}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setGames(res);
        setLoading(false);
      })
      .catch((err) => {
        alert(err + "\nPlease report this to Soodam.re");
      });
  };

  const searchGames = async (query: string) => {
    await fetch(`/api/games/search?q=${query}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${getCookie(".frameworksession")}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.games) {
          setGames(res.games);
        } else {
          setGames([]);
        }
      })
      .catch((err) => {
        alert(err + "\nPlease report this to Soodam.re");
      });
  };

  return (
    <Framework
      user={user}
      activeTab="games"
      modernTitle="Games"
      modernSubtitle="Browse the expansive library of games on Framework."
    >
      <Grid columns={6}>
        <Grid.Col span={mobile ? 6 : 4}>
          <Group mb={32}>
            <TextInput
              icon={<HiSearch />}
              placeholder="Search for games"
              onChange={(e) => searchGames(e.currentTarget.value)}
            />
          </Group>

          <Grid columns={3}>
            {games.length > 0 &&
              games.map((game) => (
                <Grid.Col span={1} key={game.id}>
                  <GameCard game={game} />
                </Grid.Col>
              ))}
            {games.length == 0 && (
              <Grid.Col span={3}>
                <ModernEmptyState
                  title="No games found"
                  body="Try switching up your filter."
                  shaded
                />
              </Grid.Col>
            )}
          </Grid>
        </Grid.Col>
        <Grid.Col span={mobile ? 6 : 2}>
          <ShadedCard title="Filters" titleWithBorder>
            <Stack spacing={12}>
              <AscDescFilter
                label="Likes"
                onChange={(value) => setFilter({ ...filter, likes: value })}
                value={filter.likes}
                description="Sort by the number of likes"
              />
              <AscDescFilter
                label="Dislikes"
                onChange={(value) => setFilter({ ...filter, dislikes: value })}
                value={filter.dislikes}
                description="Sort by the number of dislikes"
              />
              <AscDescFilter
                label="Visits"
                onChange={(value) => setFilter({ ...filter, visits: value })}
                value={filter.visits}
                description="Sort by the number of visits"
              />
              <MultiSelect
                data={Object.keys(genreMap).map((key) => ({
                  value: key,
                  label: genreMap[key as GameGenre],
                }))}
                label="Genres"
                placeholder="No genre filter"
                onChange={(value: GameGenre[]) =>
                  setFilter({ ...filter, genres: value })
                }
                value={filter.genres || []}
                description="Filter by genres of games"
                searchable
              />
              <Button
                variant="subtle"
                onClick={updateGames}
                leftIcon={<HiFilter />}
                loading={loading}
              >
                Apply Filter
              </Button>
            </Stack>
          </ShadedCard>
        </Grid.Col>
      </Grid>
    </Framework>
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
    select: gameSelect,
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
