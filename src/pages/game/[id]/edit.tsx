import { Grid, Tabs, Title } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import {
  HiCurrencyDollar,
  HiExclamationCircle,
  HiServer,
  HiViewList,
} from "react-icons/hi";
import AgeRating from "../../../components/EditGame/AgeRating";
import Details from "../../../components/EditGame/Details";
import Funding from "../../../components/EditGame/Funding";
import Servers from "../../../components/EditGame/Servers";
import Framework from "../../../components/Framework";
import authorizedRoute from "../../../util/authorizedRoute";
import prisma from "../../../util/prisma";
import { Game, gameSelect, User } from "../../../util/prisma-types";
import useMediaQuery from "../../../util/useMediaQuery";

interface EditGameProps {
  game: Game;
  user: User;
}

const EditGame: NextPage<EditGameProps> = ({ game, user }) => {
  const mobile = useMediaQuery("768");

  return (
    <Framework
      activeTab="invent"
      user={user}
      modernTitle={`Editing ${game.name}`}
      modernSubtitle="Configure your games details and other settings."
    >
      <Tabs defaultValue="details" variant="pills">
        <Tabs.List>
          <Tabs.Tab value="details" icon={<HiViewList />}>
            Details
          </Tabs.Tab>
          <Tabs.Tab value="funding" icon={<HiCurrencyDollar />}>
            Funding
          </Tabs.Tab>
          <Tabs.Tab value="servers" icon={<HiServer />}>
            Servers
          </Tabs.Tab>
          <Tabs.Tab value="age" icon={<HiExclamationCircle />}>
            Age Rating
          </Tabs.Tab>
        </Tabs.List>

        {[Details, Funding, Servers, AgeRating].map((Component, index) => (
          <Component key={index} game={game} />
        ))}
      </Tabs>
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
