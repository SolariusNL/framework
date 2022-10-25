import { ScrollArea, Tabs } from "@mantine/core";
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
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";
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
      <Tabs
        variant="pills"
        orientation={mobile ? "horizontal" : "vertical"}
        value={tab}
        onTabChange={(value) => setTab(value as string)}
      >
        <ScrollArea offsetScrollbars>
          <Tabs.List>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              <Tabs.Tab value="games" icon={<HiViewGrid />}>
                Games
              </Tabs.Tab>

              <Link href="/checklists">
                <Tabs.Tab value="checklists" icon={<HiClipboardCheck />}>
                  Checklists
                </Tabs.Tab>
              </Link>

              <Tabs.Tab value="sounds" icon={<HiMusicNote />}>
                Sounds
              </Tabs.Tab>

              <Tabs.Tab value="gamepasses" icon={<HiTicket />}>
                Game Passes
              </Tabs.Tab>

              <Tabs.Tab value="shirts" icon={<HiShoppingCart />}>
                Shirts
              </Tabs.Tab>

              <Tabs.Tab value="advertisements" icon={<HiFilm />}>
                Advertisements
              </Tabs.Tab>

              <Tabs.Tab value="updates" icon={<HiCloud />}>
                Game update logs
              </Tabs.Tab>

              <Tabs.Tab value="developer" icon={<HiIdentification />}>
                Developer Profile
              </Tabs.Tab>

              <Tabs.Tab value="connections" icon={<HiServer />}>
                Connections
              </Tabs.Tab>

              <Tabs.Tab value="nucleus" icon={<HiKey />}>
                Nucleus
              </Tabs.Tab>

              <Tabs.Tab value="snippets" icon={<HiScissors />}>
                Code Snippets
              </Tabs.Tab>

              <Tabs.Tab value="secrets" icon={<HiLockClosed />}>
                Secrets
              </Tabs.Tab>
            </div>
          </Tabs.List>
        </ScrollArea>

        <Games user={user} />
        <Sounds user={user} />
        <GamePasses user={user} />
        <Shirts user={user} />
        <Advertisements user={user} />
        <GameUpdates user={user} />
        <DeveloperProfile user={user} />
        <Connections user={user} />
        <Nucleus user={user} />
        <Snippets user={user} />
        <Secrets user={user} />
      </Tabs>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Invent;
