import { Title } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import Framework from "../../../components/Framework";
import authorizedRoute from "../../../util/authorizedRoute";
import prisma from "../../../util/prisma";
import { Game, gameSelect, User } from "../../../util/prisma-types";

interface EditGameProps {
  game: Game;
  user: User;
}

const EditGame: NextPage<EditGameProps> = ({ game, user }) => {
  return (
    <Framework activeTab="invent" user={user}>
      <Title mb={24}>Editing {game.name}</Title>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.query;
  const auth = await authorizedRoute(context, true, false);

  if (auth.redirect) {
    return auth;
  }

  const game = JSON.parse(
    JSON.stringify(
      await prisma.game.findFirst({
        where: { id: Number(id) },
        select: gameSelect,
      })
    )
  );

  if (game.author.id != auth.props.user?.id) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }

  return {
    props: {
      game,
      user: auth.props.user,
    },
  };
}

export default EditGame;
