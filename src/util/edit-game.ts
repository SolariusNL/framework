import { GetServerSideProps } from "next";
import authorizedRoute from "./auth";
import { exclude } from "./exclude";
import prisma from "./prisma";
import { gameSelect } from "./prisma-types";

export const getEditGameSSP: GetServerSideProps = async (ctx) => {
  const { id } = ctx.query;
  const auth = await authorizedRoute(ctx, true, false);

  if (auth.redirect) return auth;
  if (!id)
    return {
      redirect: {
        destination: "/invent/games",
        permanent: false,
      },
    };

  const game = await prisma.game.findFirst({
    where: {
      id: Number(id),
      authorId: auth.props.user?.id,
    },
    select: {
      ...exclude(gameSelect, "likedBy", "dislikedBy"),
      datastores: {
        select: {
          id: true,
          name: true,
          desc: true,
          createdAt: true,
        },
      },
      envs: true,
      team: true,
      _count: {
        select: {
          likedBy: true,
          dislikedBy: true,
          followers: true,
        },
      },
    },
  });

  if (!game)
    return {
      redirect: {
        destination: "/invent/games",
        permanent: false,
      },
    };

  return {
    props: {
      game: JSON.parse(JSON.stringify(game)),
      user: auth.props.user,
    },
  };
};
