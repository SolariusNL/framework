import GameCard from "@/components/game-card";
import ModernEmptyState from "@/components/modern-empty-state";
import TeamsViewProvider from "@/components/teams/teams-view";
import { TeamType } from "@/pages/teams";
import authorizedRoute from "@/util/auth";
import cast from "@/util/cast";
import prisma from "@/util/prisma";
import { Game, gameSelect, NonUser, User } from "@/util/prisma-types";
import { getTeam } from "@/util/teams";
import { Rating, Team } from "@prisma/client";
import { GetServerSideProps } from "next";

export type TeamViewGamesProps = {
  user: User;
  team: TeamType & {
    games: {
      name: string;
      iconUri: string;
      _count: {
        likedBy: number;
        dislikedBy: number;
      };
      visits: number;
      author: NonUser;
      rating: Rating;
    }[];
  };
  games: Game[];
};

const TeamViewGames: React.FC<TeamViewGamesProps> = ({ user, team, games }) => {
  return (
    <TeamsViewProvider user={user} team={team} active="games">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12">
        {games.map((game) => (
          <GameCard game={game} key={game.id} />
        ))}
        {games.length === 0 && (
          <div className="flex items-center justify-center col-span-full">
            <ModernEmptyState
              title="No games"
              body="This team has no games yet."
            />
          </div>
        )}
      </div>
    </TeamsViewProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const auth = await authorizedRoute(ctx, true, false);
  const slug = ctx.query.slug;
  const team = await getTeam(String(slug));

  if (auth.redirect) return auth;

  if (!team) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }

  const games = await prisma.game.findMany({
    where: {
      teamId: cast<Team>(team).id,
    },
    select: gameSelect,
  });

  return {
    props: {
      user: auth.props.user,
      team: JSON.parse(JSON.stringify(team)),
      games: JSON.parse(JSON.stringify(games)),
    },
  };
};

export default TeamViewGames;
