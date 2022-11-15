import {
  Button,
  Grid,
  Group,
  Modal,
  MultiSelect,
  Stack,
  TextInput,
} from "@mantine/core";
import { GameGenre } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from "next";
import React, { useEffect } from "react";
import { HiFilter, HiSearch } from "react-icons/hi";
import AscDescFilter from "../components/Filter/AscDescFilter";
import Framework from "../components/Framework";
import GameCard from "../components/GameCard";
import ModernEmptyState from "../components/ModernEmptyState";
import ShadedCard from "../components/ShadedCard";
import Stateful from "../components/Stateful";
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
  const [filter, setFilter] = React.useState<GameFilter>({
    likes: "desc",
    dislikes: "asc",
    visits: "desc",
    genres: null,
  });
  const [games, setGames] = React.useState<Game[]>(initialGames);
  const [loading, setLoading] = React.useState(false);
  const mobile = useMediaQuery("768");

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

  useEffect(() => {
    updateGames();
  }, [filter]);

  const filterUi = (
    <Stack spacing={12}>
      {[
        {
          label: "Likes",
          onChange: (value: "desc" | "asc") =>
            setFilter({ ...filter, likes: value }),
          value: filter.likes,
          description: "Sort by number of likes",
        },
        {
          label: "Dislikes",
          onChange: (value: "desc" | "asc") =>
            setFilter({ ...filter, dislikes: value }),
          value: filter.dislikes,
          description: "Sort by number of dislikes",
        },
        {
          label: "Visits",
          onChange: (value: "desc" | "asc") =>
            setFilter({ ...filter, visits: value }),
          value: filter.visits,
          description: "Sort by number of visits",
        },
      ].map((item) => (
        <AscDescFilter
          key={item.label}
          label={item.label}
          description={item.description}
          value={item.value}
          onChange={item.onChange}
        />
      ))}
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
  );

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
      <Group className="items-center" mb={32}>
        <TextInput
          icon={<HiSearch />}
          placeholder="Search for games"
          onChange={(e) => searchGames(e.currentTarget.value)}
        />
        {mobile && (
          <Stateful>
            {(open, setOpen) => (
              <>
                <Button leftIcon={<HiFilter />} onClick={() => setOpen(true)}>
                  Filter
                </Button>
                <Modal
                  title="Filter"
                  opened={open}
                  onClose={() => setOpen(false)}
                >
                  {filterUi}
                </Modal>
              </>
            )}
          </Stateful>
        )}
      </Group>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
        <div className="md:col-span-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
        {!mobile && (
          <ShadedCard title="Filter" className="md:col-span-2 h-fit">
            {filterUi}
          </ShadedCard>
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
