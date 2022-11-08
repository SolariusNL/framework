import { Button, Grid, Group, Menu, Select, TextInput } from "@mantine/core";
import { GameGenre } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from "next";
import React from "react";
import { HiFilter, HiSearch } from "react-icons/hi";
import Framework from "../components/Framework";
import GameCard from "../components/GameCard";
import ModernEmptyState from "../components/ModernEmptyState";
import authorizedRoute from "../util/authorizedRoute";
import { getCookie } from "../util/cookies";
import prisma from "../util/prisma";
import { Game, gameSelect, User } from "../util/prisma-types";
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
      <Group mb={32}>
        <TextInput
          icon={<HiSearch />}
          placeholder="Search for games"
          onChange={(e) => searchGames(e.currentTarget.value)}
        />
        <Menu closeOnItemClick={false} shadow="md">
          <Menu.Target>
            <Button leftIcon={<HiFilter />}>Filter</Button>
          </Menu.Target>
          <Menu.Dropdown>
            {[
              {
                label: "Likes",
                description: "Sort by likes",
                value: filter.likes,
                onChange: (value: "desc" | "asc") =>
                  setFilter({ ...filter, likes: value }),
              },
              {
                label: "Dislikes",
                description: "Sort by dislikes",
                value: filter.dislikes,
                onChange: (value: "desc" | "asc") =>
                  setFilter({ ...filter, dislikes: value }),
              },
              {
                label: "Visits",
                description: "Sort by visits",
                value: filter.visits,
                onChange: (value: "desc" | "asc") =>
                  setFilter({ ...filter, visits: value }),
              },
            ].map((item) => (
              <Menu.Item key={item.label}>
                <Select
                  label={item.label}
                  description={item.description}
                  data={[
                    { label: "Most", value: "desc" },
                    { label: "Least", value: "asc" },
                  ]}
                  value={item.value}
                  onChange={(value) => item.onChange(value as "desc" | "asc")}
                />
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </Group>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {games.length > 0 &&
          games.map((game) => <GameCard game={game} key={game.id} />)}
        {games.length == 0 && (
          <Grid.Col span={3}>
            <ModernEmptyState
              title="No games found"
              body="Try switching up your filter."
              shaded
            />
          </Grid.Col>
        )}
      </div>
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
