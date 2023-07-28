import StudioPromptBackground from "@/assets/subtlebackground.png";
import Framework from "@/components/framework";
import Advertisements from "@/components/invent/advertisements";
import GameUpdates from "@/components/invent/game-updates";
import GamePasses from "@/components/invent/gamepasses";
import Games from "@/components/invent/games";
import Nucleus from "@/components/invent/nucleus";
import Secrets from "@/components/invent/secrets";
import Shirts from "@/components/invent/shirts";
import Snippets from "@/components/invent/snippets";
import Sounds from "@/components/invent/sounds";
import TabNav from "@/components/tab-nav";
import authorizedRoute from "@/util/auth";
import useMediaQuery from "@/util/media-query";
import prisma from "@/util/prisma";
import { User, gameSelect } from "@/util/prisma-types";
import { Skeleton } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { GetServerSidePropsContext, NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HiClipboardCheck,
  HiCloud,
  HiDownload,
  HiFilm,
  HiIdentification,
  HiKey,
  HiMusicNote,
  HiScissors,
  HiServer,
  HiShoppingCart,
  HiTicket,
  HiViewGrid,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";

interface InventProps {
  user: User;
  activePage: string;
}

const tabs = [
  {
    name: "games",
    component: Games,
    href: "/invent/games",
    tab: {
      icon: <HiViewGrid />,
      label: "Games",
    },
  },
  {
    name: "checklists",
    href: "/checklists",
    tab: {
      icon: <HiClipboardCheck />,
      label: "Checklists",
    },
  },
  {
    name: "sounds",
    component: Sounds,
    href: "/invent/sounds",
    tab: {
      icon: <HiMusicNote />,
      label: "Sounds",
    },
  },
  {
    name: "gamepasses",
    component: GamePasses,
    href: "/invent/gamepasses",
    tab: {
      icon: <HiTicket />,
      label: "Game Passes",
    },
  },
  {
    name: "shirts",
    component: Shirts,
    href: "/invent/shirts",
    tab: {
      icon: <HiShoppingCart />,
      label: "Shirts",
    },
  },
  {
    name: "snippets",
    component: Snippets,
    href: "/invent/snippets",
    tab: {
      icon: <HiScissors />,
      label: "Snippets",
    },
  },
  {
    name: "secrets",
    component: Secrets,
    href: "/invent/secrets",
    tab: {
      icon: <HiKey />,
      label: "Secrets",
    },
  },
  {
    name: "nucleus",
    component: Nucleus,
    href: "/invent/nucleus",
    tab: {
      icon: <HiServer />,
      label: "Nucleus",
    },
  },
  {
    name: "connections",
    href: "/developer/servers",
    tab: {
      icon: <HiCloud />,
      label: "Connections",
    },
  },
  {
    name: "advertisements",
    component: Advertisements,
    href: "/invent/advertisements",
    tab: {
      icon: <HiFilm />,
      label: "Advertisements",
    },
  },
  {
    name: "updates",
    component: GameUpdates,
    href: "/invent/updates",
    tab: {
      icon: <HiDownload />,
      label: "Game Updates",
    },
  },
  {
    name: "developer",
    href: "/developer/profile",
    tab: {
      icon: <HiIdentification />,
      label: "Developer Profile",
    },
  },
];

const Invent: NextPage<InventProps> = ({ user, activePage }) => {
  const mobile = useMediaQuery("768");
  const [studioHidden] = useLocalStorage({
    key: "studio-prompt-seen",
    defaultValue: false,
  });
  const [active, setActive] = useState(activePage || "games");
  const page = tabs.find((item) => item.name === active) || tabs[0];

  useEffect(() => {
    console.log(page);
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
        value={active}
      >
        <ReactNoSSR
          onSSR={
            <>
              {Array.from({ length: 12 }).map((_, i) => (
                <div className="flex flex-col gap-1" key={i}>
                  <Skeleton height={32} />
                </div>
              ))}
            </>
          }
        >
          <TabNav.List className="flex-wrap gap-1">
            {tabs.map((tab) => (
              <Link href={tab.href} key={tab.name}>
                <TabNav.Tab
                  key={tab.name}
                  value={tab.name}
                  icon={tab.tab.icon}
                  classNames={{ root: "relative !rounded-md" }}
                  className="rounded-md"
                >
                  {tab.tab.label}
                </TabNav.Tab>
              </Link>
            ))}

            {studioHidden && (
              <Link href="/studio/activate">
                <TabNav.Tab
                  value="studio"
                  icon={<HiDownload />}
                  classNames={{ root: "relative !rounded-md" }}
                  className="rounded-md"
                >
                  <Image
                    src={StudioPromptBackground.src}
                    alt="Subtle background"
                    layout="fill"
                    objectFit="cover"
                    objectPosition="left"
                    className="absolute inset-0 !rounded-md scale-x-150"
                  />
                  Download Studio
                </TabNav.Tab>
              </Link>
            )}
          </TabNav.List>
        </ReactNoSSR>

        <ReactNoSSR
          onSSR={
            <>
              <Skeleton height={300} />
            </>
          }
        >
          {page.component && page.component({ user })}
        </ReactNoSSR>
      </TabNav>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const auth = await authorizedRoute(context, true, false);
  if (auth.redirect) return auth;

  const { page } = context.query;
  const pageStr = typeof page === "string" ? page : "games";

  const games = await prisma.game.findMany({
    where: {
      authorId: auth.props?.user?.id,
    },
    select: gameSelect,
  });

  if (!tabs.find((item) => item.name === pageStr)) {
    return {
      redirect: {
        destination: "/invent/games",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: JSON.parse(
        JSON.stringify({
          ...auth.props.user,
          games,
        })
      ),
      activePage: pageStr,
    },
  };
}

export default Invent;
