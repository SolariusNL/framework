import { GetServerSidePropsContext, NextPage } from "next";
import Framework from "@/components/Framework";
import GameCard from "@/components/GameCard";
import ModernEmptyState from "@/components/ModernEmptyState";
import UserCard from "@/components/UserCard";
import authorizedRoute from "@/util/auth";
import prisma from "@/util/prisma";
import {
  Game,
  NonUser,
  User,
  gameSelect,
  nonCurrentUserSelect,
} from "@/util/prisma-types";

interface SearchProps {
  user: User;
  dataType: "games" | "users" | "catalog" | "sounds";
  searchTerm: string;
  searchResults: Game[] | NonUser[] | any[];
}

const Search: NextPage<SearchProps> = ({
  user,
  dataType,
  searchTerm,
  searchResults,
}) => {
  return (
    <Framework
      user={user}
      activeTab="none"
      modernTitle={`${
        dataType === "games" ? "Games" : "Users"
      } matching "${searchTerm}"`}
      modernSubtitle="Search results for your query"
    >
      {searchResults.length === 0 ? (
        <ModernEmptyState title="No results" body="Try another search term." />
      ) : (
        <>
          {dataType === "users" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(searchResults as NonUser[]).map((user: NonUser) => (
                <div key={user.id}>
                  <UserCard user={user} />
                </div>
              ))}
            </div>
          )}
          {dataType === "games" && (
            <div className="grid grid-cols-2 gap-4 gap-y-8 md:grid-cols-5 sm:grid-cols-3">
              {(searchResults as Game[]).map((game: Game) => (
                <div key={game.id}>
                  <GameCard game={game} />
                </div>
              ))}
            </div>
          )}
        </>
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
        select: {
          ...nonCurrentUserSelect.select,
          verified: true,
        },
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
