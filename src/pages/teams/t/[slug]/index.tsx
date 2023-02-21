import { Rating } from "@prisma/client";
import { GetServerSideProps } from "next";
import { TeamType } from "../..";
import TeamsViewProvider from "../../../../components/Teams/TeamsView";
import authorizedRoute from "../../../../util/auth";
import prisma from "../../../../util/prisma";
import {
  nonCurrentUserSelect,
  NonUser,
  User
} from "../../../../util/prisma-types";

export type TeamViewProps = {
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
};

const TeamView: React.FC<TeamViewProps> = ({ user, team }) => {
  return (
    <TeamsViewProvider user={user} teamSlug={team.slug} active="details">
      <p>Hello</p>
    </TeamsViewProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const auth = await authorizedRoute(ctx, true, false);
  const slug = ctx.query.slug;

  if (auth.redirect) return auth;

  const team = await prisma.team.findFirst({
    where: {
      slug: String(slug),
    },
    include: {
      _count: {
        select: {
          members: true,
          games: true,
        },
      },
      owner: {
        select: nonCurrentUserSelect.select,
      },
    },
  });

  if (!team) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: auth.props.user,
      team: JSON.parse(JSON.stringify(team)),
    },
  };
};

export default TeamView;
