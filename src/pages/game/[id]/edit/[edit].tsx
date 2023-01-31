import { NavLink } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HiCloud,
  HiCurrencyDollar,
  HiDatabase,
  HiExclamationCircle,
  HiLockClosed,
  HiServer,
  HiShoppingBag,
  HiViewList,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import Access from "../../../../components/EditGame/Access";
import AgeRating from "../../../../components/EditGame/AgeRating";
import Datastores from "../../../../components/EditGame/Datastores";
import Details from "../../../../components/EditGame/Details";
import Funding from "../../../../components/EditGame/Funding";
import Servers from "../../../../components/EditGame/Servers";
import Store from "../../../../components/EditGame/Store";
import Updates from "../../../../components/EditGame/Updates";
import Framework from "../../../../components/Framework";
import SidebarTabNavigation from "../../../../layouts/SidebarTabNavigation";
import authorizedRoute from "../../../../util/authorizedRoute";
import prisma from "../../../../util/prisma";
import { Game, gameSelect, User } from "../../../../util/prisma-types";
import useMediaQuery from "../../../../util/useMediaQuery";

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
  activePage: string;
}

const tabs = [
  {
    title: "Details",
    desc: "Configure your games details and appearance on the site.",
    icon: <HiViewList />,
    component: Details,
  },
  {
    title: "Funding",
    desc: "Configure game funds to raise Tickets for your game.",
    icon: <HiCurrencyDollar />,
    component: Funding,
  },
  {
    title: "Servers",
    desc: "Configure self-hosted Cosmic servers and Soodam.re dedicated servers.",
    icon: <HiServer />,
    component: Servers,
  },
  {
    title: "Rating",
    desc: "Configure your games age rating and content warnings.",
    icon: <HiExclamationCircle />,
    component: AgeRating,
  },
  {
    title: "Datastores",
    desc: "Configure datastores to store game data and user data.",
    icon: <HiDatabase />,
    component: Datastores,
  },
  {
    title: "Store",
    desc: "Configure your games store and gamepasses.",
    icon: <HiShoppingBag />,
    component: Store,
  },
  {
    title: "Access",
    desc: "Configure your games access.",
    icon: <HiLockClosed />,
    component: Access,
  },
  {
    title: "Updates",
    desc: "Configure update logs for your game.",
    icon: <HiCloud />,
    component: Updates,
  },
];

const EditGame: NextPage<EditGameProps> = ({ game, user, activePage }) => {
  const [tab, setTab] = useState("details");
  const [active, setActive] = useState(activePage || "details");
  const page =
    tabs.find((item) => item.title.toLowerCase() === active) || tabs[0];

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get("view");
    if (view) setTab(view);
  }, []);

  const mobile = useMediaQuery("768");

  return (
    <Framework
      activeTab="invent"
      user={user}
      modernTitle={`Editing ${game.name}`}
      modernSubtitle="Configure your games details and other settings."
    >
      <SidebarTabNavigation>
        <SidebarTabNavigation.Sidebar>
          {tabs.map((tab, index) => (
            <Link
              passHref
              href={`/game/${game.id}/edit/${tab.title.toLowerCase()}`}
              key={index}
            >
              <NavLink
                label={tab.title}
                description={tab.desc}
                icon={tab.icon}
                active={active === tab.title.toLowerCase()}
                className="rounded-md"
              />
            </Link>
          ))}
        </SidebarTabNavigation.Sidebar>
        <SidebarTabNavigation.Content>
          <ReactNoSSR>
            {page.component({
              game: game as any,
            })}
          </ReactNoSSR>
        </SidebarTabNavigation.Content>
      </SidebarTabNavigation>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.query;
  const auth = await authorizedRoute(context, true, false);
  const { edit } = context.query;
  const pageStr = typeof edit === "string" ? edit : "details";

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
          gamepasses: {
            include: {
              owners: {
                select: { id: true },
              },
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

  if (!tabs.find((item) => item.title.toLowerCase() === pageStr)) {
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
      activePage: pageStr,
    },
  };
}

export default EditGame;
