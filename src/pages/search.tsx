import {
  Avatar,
  Button,
  Grid,
  Paper,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { HiXCircle } from "react-icons/hi";
import EmptyState from "../components/EmptyState";
import Framework from "../components/Framework";
import GameCard from "../components/GameCard";
import authorizedRoute from "../util/authorizedRoute";
import prisma from "../util/prisma";
import {
  Game,
  gameSelect,
  nonCurrentUserSelect,
  User,
} from "../util/prisma-types";

interface SearchProps {
  user: User;
  dataType: "games" | "users" | "catalog" | "sounds";
  searchTerm: string;
  searchResults: Game[] | User[] | any[];
}

const Search: NextPage<SearchProps> = ({
  user,
  dataType,
  searchTerm,
  searchResults,
}) => {
  return (
    <Framework user={user} activeTab="none">
      <Title mb={24}>
        {dataType === "games" ? "Games" : "Users"} matching &quot;{searchTerm}
        &quot;
      </Title>

      {searchResults.length === 0 ? (
        <EmptyState title="No results" body="Try another search term." />
      ) : (
        <Grid>
          {(dataType === "games" &&
            // @ts-ignore
            searchResults.map((game: Game) => (
              <Grid.Col xs={6} md={4} sm={6} lg={4} key={game.id}>
                <GameCard game={game} />
              </Grid.Col>
            ))) ||
            (dataType === "users" &&
              // @ts-ignore
              searchResults.map((user: User) => (
                <Grid.Col xs={4.5} md={4.5} sm={4.5} lg={3.5} key={user.id}>
                  <Paper
                    radius="md"
                    withBorder
                    p="lg"
                    sx={(theme) => ({
                      backgroundColor:
                        theme.colorScheme === "dark"
                          ? theme.colors.dark[8]
                          : theme.white,
                    })}
                    key={user.id}
                  >
                    <Avatar
                      src={user.avatarUri}
                      size={120}
                      radius={120}
                      mx="auto"
                    />
                    <Text align="center" size="lg" weight={500} mt="md">
                      {user.username}{" "}
                      {user.banned && (
                        <Tooltip label="User is banned from Framework">
                          <ThemeIcon
                            color="red"
                            variant="light"
                            radius={999}
                            size={24}
                          >
                            <HiXCircle />
                          </ThemeIcon>
                        </Tooltip>
                      )}
                    </Text>
                    <Text align="center" color="dimmed" size="sm">
                      {user.id} • {user.id}
                    </Text>
                    <Text align="center" color="dimmed" size="sm" lineClamp={2}>
                      {user.bio || "No bio"}
                    </Text>

                    <Link href={`/profile/${user.username}`} passHref>
                      <Button component="a" variant="default" fullWidth mt="md">
                        View Profile
                      </Button>
                    </Link>
                  </Paper>
                </Grid.Col>
              )))}
        </Grid>
      )}
    </Framework>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { query, category } = ctx.query;
  const auth = await authorizedRoute(ctx, true, false);

  if (auth.redirect) {
    return auth;
  }

  switch (category as SearchProps["dataType"]) {
    case "games":
      const games = await prisma.game.findMany({
        where: {
          OR: [
            { name: { contains: String(query), mode: "insensitive" } },
            { description: { contains: String(query), mode: "insensitive" } },
          ],
        },
        take: 100,
        select: gameSelect,
      });

      return {
        props: {
          user: auth.props.user,
          dataType: "games",
          searchTerm: String(query),
          searchResults: JSON.parse(JSON.stringify(games)),
        },
      };

    case "users":
      const users = await prisma.user.findMany({
        where: {
          OR: [{ username: { contains: String(query), mode: "insensitive" } }],
        },
        take: 100,
        ...nonCurrentUserSelect,
      });

      return {
        props: {
          user: auth.props.user,
          dataType: "users",
          searchTerm: String(query),
          searchResults: JSON.parse(JSON.stringify(users)),
        },
      };

    default:
      return {
        props: {
          user: auth.props.user,
          dataType: "users",
          searchTerm: String(query),
          searchResults: [],
        },
      };
  }
}

export default Search;
