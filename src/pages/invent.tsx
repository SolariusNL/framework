import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HiClipboardCheck,
  HiCloud,
  HiFilm,
  HiIdentification,
  HiKey,
  HiLockClosed,
  HiMusicNote,
  HiScissors,
  HiServer,
  HiShoppingCart,
  HiTicket,
  HiViewGrid,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import Framework from "../components/Framework";
import Advertisements from "../components/Invent/Advertisements";
import Connections from "../components/Invent/Connections";
import DeveloperProfile from "../components/Invent/DeveloperProfile";
import GamePasses from "../components/Invent/GamePasses";
import Games from "../components/Invent/Games";
import GameUpdates from "../components/Invent/GameUpdates";
import Nucleus from "../components/Invent/Nucleus";
import Secrets from "../components/Invent/Secrets";
import Shirts from "../components/Invent/Shirts";
import Snippets from "../components/Invent/Snippets";
import Sounds from "../components/Invent/Sounds";
import TabNav from "../components/TabNav";
import authorizedRoute from "../util/authorizedRoute";
import prisma from "../util/prisma";
import { gameSelect, User } from "../util/prisma-types";
import useMediaQuery from "../util/useMediaQuery";

interface InventProps {
  user: User;
}

const Invent: NextPage<InventProps> = ({ user }) => {
  const mobile = useMediaQuery("768");
  const [tab, setTab] = useState("games");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    if (view) {
      setTab(view);
    }
  }, []);

  return (
    <Framework
      user={user}
      activeTab="invent"
      modernTitle="Invent"
      modernSubtitle="Manage your games, plugins, and more"
    >
      <TabNav
        variant="pills"
        orientation={mobile ? "horizontal" : "vertical"}
        value={tab}
        onTabChange={(value) => setTab(value as string)}
      >
        <TabNav.List className="flex-wrap gap-1">
          <TabNav.Tab value="games" icon={<HiViewGrid />}>
            Games
          </TabNav.Tab>

          <Link href="/checklists" className="h-fit w-fit">
            <TabNav.Tab value="checklists" icon={<HiClipboardCheck />}>
              Checklists
            </TabNav.Tab>
          </Link>

          <TabNav.Tab value="sounds" icon={<HiMusicNote />}>
            Sounds
          </TabNav.Tab>

          <TabNav.Tab value="gamepasses" icon={<HiTicket />}>
            Game Passes
          </TabNav.Tab>

          <TabNav.Tab value="shirts" icon={<HiShoppingCart />}>
            Shirts
          </TabNav.Tab>

          <TabNav.Tab value="advertisements" icon={<HiFilm />}>
            Advertisements
          </TabNav.Tab>

          <TabNav.Tab value="updates" icon={<HiCloud />}>
            Game update logs
          </TabNav.Tab>

          <TabNav.Tab value="developer" icon={<HiIdentification />}>
            Developer Profile
          </TabNav.Tab>

          <TabNav.Tab value="connections" icon={<HiServer />}>
            Connections
          </TabNav.Tab>

          <TabNav.Tab value="nucleus" icon={<HiKey />}>
            Nucleus
          </TabNav.Tab>

          <TabNav.Tab value="snippets" icon={<HiScissors />}>
            Code Snippets
          </TabNav.Tab>

          <TabNav.Tab value="secrets" icon={<HiLockClosed />}>
            Secrets
          </TabNav.Tab>
        </TabNav.List>

        {[
          Games,
          Sounds,
          GamePasses,
          Shirts,
          Advertisements,
          GameUpdates,
          DeveloperProfile,
          Connections,
          Nucleus,
          Snippets,
          Secrets,
        ].map((Component, index) => (
          <ReactNoSSR key={index}>
            <Component user={user} />
          </ReactNoSSR>
        ))}
      </TabNav>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const auth = await authorizedRoute(context, true, false);
  if (auth.redirect) return auth;

  const games = await prisma.game.findMany({
    where: {
      authorId: auth.props?.user?.id,
    },
    select: gameSelect,
  });

  return {
    props: {
      user: JSON.parse(
        JSON.stringify({
          ...auth.props.user,
          games,
        })
      ),
    },
  };
}

export default Invent;
