import { Button, Grid, MultiSelect, Stack, Title } from "@mantine/core";
import { GameGenre } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from "next";
import React from "react";
import EmptyState from "../components/EmptyState";
import AscDescFilter from "../components/Filter/AscDescFilter";
import Framework from "../components/Framework";
import GameCard from "../components/GameCard";
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

  const updateGames = async () => {
    const params = new URLSearchParams();
    if (filter.likes) {
      params.append("likes", filter.likes);
    }
    if (filter.dislikes) {
      params.append("dislikes", filter.dislikes);
    }
    if (filter.visits) {
      params.append("visits", filter.visits);
    }
    if (filter.genres) {
      params.append("genres", filter.genres.join(","));
    }

    await fetch(`/api/games/1?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${getCookie(".frameworksession")}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setGames(res.games);
      })
      .catch((err) => {
        alert(err + "\nPlease report this to Soodam.re");
      });
  };

  return (
    <Framework user={user} activeTab="games">
      <Grid columns={24}>
        <Grid.Col span={mobile ? 24 : 19}>
          <Title mb={24}>Games</Title>
          <Grid>
            {games.map((game) => (
              <Grid.Col md={6} sm={6} lg={4} key={game.id}>
                <GameCard game={game} />
              </Grid.Col>
            ))}
            {games.length == 0 && (
              <EmptyState title="No games" body="No games found" />
            )}
          </Grid>
        </Grid.Col>

        <Grid.Col span={mobile ? 24 : 5}>
          <Title mb={24} order={3}>
            Filter
          </Title>

          <Stack spacing={8}>
            <AscDescFilter
              label="Likes"
              onChange={(value) => setFilter({ ...filter, likes: value })}
              value={filter.likes}
            />
            <AscDescFilter
              label="Dislikes"
              onChange={(value) => setFilter({ ...filter, dislikes: value })}
              value={filter.dislikes}
            />
            <AscDescFilter
              label="Visits"
              onChange={(value) => setFilter({ ...filter, visits: value })}
              value={filter.visits}
            />
            <MultiSelect
              data={Object.keys(genreMap).map((key) => ({
                value: key,
                label: genreMap[key as GameGenre],
              }))}
              label="Genres"
              placeholder="Filter by genres"
              onChange={(value: GameGenre[]) =>
                setFilter({ ...filter, genres: value })
              }
              value={filter.genres || []}
            />
            <Button variant="subtle" onClick={updateGames}>
              Update
            </Button>
          </Stack>
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
