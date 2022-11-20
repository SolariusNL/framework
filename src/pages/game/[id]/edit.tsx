import { GetServerSidePropsContext, NextPage } from "next";
import {
  HiCurrencyDollar,
  HiDatabase,
  HiExclamationCircle,
  HiServer,
  HiViewList,
} from "react-icons/hi";
import AgeRating from "../../../components/EditGame/AgeRating";
import Details from "../../../components/EditGame/Details";
import Funding from "../../../components/EditGame/Funding";
import Servers from "../../../components/EditGame/Servers";
import Framework from "../../../components/Framework";
import TabNav from "../../../components/TabNav";
import authorizedRoute from "../../../util/authorizedRoute";
import prisma from "../../../util/prisma";
import { Game, gameSelect, User } from "../../../util/prisma-types";
import ReactNoSSR from "react-no-ssr";
import { useEffect, useState } from "react";
import Datastores from "../../../components/EditGame/Datastores";

export type GameWithDatastore = Game & {
  datastores: {
    id: number;
    name: string;
    desc: string;
    createdAt: Date;
  }[];
};

interface EditGameProps {
  game: GameWithDatastore;
  user: User;
}

const EditGame: NextPage<EditGameProps> = ({ game, user }) => {
  const [tab, setTab] = useState("details");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get("view");
    if (view) setTab(view);
  }, []);

  return (
    <Framework
      activeTab="invent"
      user={user}
      modernTitle={`Editing ${game.name}`}
      modernSubtitle="Configure your games details and other settings."
    >
      <TabNav value={tab ?? "details"} onTabChange={(t) => setTab(String(t))}>
        <TabNav.List>
          <TabNav.Tab value="details" icon={<HiViewList />}>
            Details
          </TabNav.Tab>
          <TabNav.Tab value="funding" icon={<HiCurrencyDollar />}>
            Funding
          </TabNav.Tab>
          <TabNav.Tab value="servers" icon={<HiServer />}>
            Servers
          </TabNav.Tab>
          <TabNav.Tab value="age" icon={<HiExclamationCircle />}>
            Age Rating
          </TabNav.Tab>
          <TabNav.Tab value="datastores" icon={<HiDatabase />}>
            Datastores
          </TabNav.Tab>
        </TabNav.List>

        {[Details, Funding, Servers, AgeRating, Datastores].map(
          (Component, index) => (
            <ReactNoSSR key={index}>
              <Component game={game} />
            </ReactNoSSR>
          )
        )}
      </TabNav>
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
        select: {
          ...gameSelect,
          datastores: {
            select: {
              id: true,
              name: true,
              desc: true,
              createdAt: true,
            },
          },
        },
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
