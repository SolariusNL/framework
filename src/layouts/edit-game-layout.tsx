import Framework from "@/components/framework";
import { Section } from "@/components/home/friends";
import ShadedButton from "@/components/shaded-button";
import SidebarTabNavigation from "@/layouts/SidebarTabNavigation";
import abbreviateNumber from "@/util/abbreviate";
import { Fw } from "@/util/fw";
import getMediaUrl from "@/util/get-media";
import { Game, User } from "@/util/prisma-types";
import { getGenreText } from "@/util/universe/genre";
import {
  Anchor,
  Avatar,
  Badge,
  Breadcrumbs,
  Divider,
  NavLink,
  Text,
} from "@mantine/core";
import { GameDatastore, GameEnvironmentVariable, Team } from "@prisma/client";
import Link from "next/link";
import { FC } from "react";
import {
  HiBookOpen,
  HiCode,
  HiCurrencyDollar,
  HiDatabase,
  HiLocationMarker,
  HiLockClosed,
  HiOutlinePhotograph,
  HiOutlineStar,
  HiOutlineTag,
  HiOutlineUserGroup,
  HiServer,
  HiShoppingBag,
  HiSpeakerphone,
  HiStatusOnline,
  HiUserAdd,
} from "react-icons/hi";

export type EditableGamePageProps = {
  user: User;
  game: EditableGame;
};
export type EditableGame = Game & {
  datastores: GameDatastore[];
  envs: GameEnvironmentVariable[];
  team: Team;
  _count: {
    likedBy: number;
    followers: number;
    dislikedBy: number;
  };
};
export enum EditGameRoutes {
  Details = "details",
  Art = "art",
  Funds = "funds",
  Servers = "servers",
  Compliance = "compliance",
  Datastores = "datastores",
  Environment = "environment",
  Store = "store",
  Access = "access",
  Updates = "updates",
}

type EditGameLayoutProps = {
  game: EditableGame;
  children: React.ReactNode;
  activePage: EditGameRoutes;
  user: User;
};

const tabs: Record<
  EditGameRoutes,
  {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
  }
> = {
  [EditGameRoutes.Details]: {
    title: "Home",
    subtitle: "Configure basic details about your game, and see some stats.",
    icon: <HiLocationMarker />,
  },
  [EditGameRoutes.Art]: {
    title: "Art",
    subtitle: "Configure your games icon and thumbnail.",
    icon: <HiOutlinePhotograph />,
  },
  [EditGameRoutes.Funds]: {
    title: "Funding",
    subtitle: "Raise funds for your game.",
    icon: <HiCurrencyDollar />,
  },
  [EditGameRoutes.Servers]: {
    title: "Servers",
    subtitle: "Configure Cosmic servers for your game.",
    icon: <HiServer />,
  },
  [EditGameRoutes.Compliance]: {
    title: "Compliance",
    subtitle: "Configure your games age rating and content warnings.",
    icon: <HiBookOpen />,
  },
  [EditGameRoutes.Datastores]: {
    title: "Datastores",
    subtitle: "Configure datastores to store game data and user data.",
    icon: <HiDatabase />,
  },
  [EditGameRoutes.Environment]: {
    title: "Environment Variables",
    subtitle: "Configure environment variables for your game.",
    icon: <HiCode />,
  },
  [EditGameRoutes.Store]: {
    title: "Store",
    subtitle: "Sell in-game items and gamepasses.",
    icon: <HiShoppingBag />,
  },
  [EditGameRoutes.Access]: {
    title: "Access",
    subtitle: "Configure your games access.",
    icon: <HiLockClosed />,
  },
  [EditGameRoutes.Updates]: {
    title: "Updates",
    subtitle: "Configure your games update settings.",
    icon: <HiSpeakerphone />,
  },
};

export const gameDetails = (game: EditableGame) => {
  return (
    <div className="flex gap-4">
      {[
        {
          icon: <HiOutlineUserGroup />,
          value: `${abbreviateNumber(game.visits)} visits`,
        },
        {
          icon: <HiOutlineTag />,
          value: getGenreText(game.genre),
        },
        {
          icon: <HiOutlineStar />,
          value: `${
            Math.round(
              (game._count.likedBy /
                (game._count.likedBy + game._count.dislikedBy)) *
                100
            ) || 0
          }%`,
        },
      ].map((item, i) => (
        <Text
          size="sm"
          color="dimmed"
          className="flex items-center gap-1"
          key={i}
        >
          {item.icon}
          {item.value}
        </Text>
      ))}
    </div>
  );
};

const EditGame: FC<EditGameLayoutProps> = ({
  game,
  children,
  activePage,
  user,
}) => {
  const route = tabs[activePage];

  return (
    <Framework user={user} activeTab="invent" noPadding>
      <div className="w-full flex justify-center mt-8">
        <div className="w-full px-4">
          <SidebarTabNavigation>
            <SidebarTabNavigation.Sidebar>
              <Link href={`/game/${game.id}`}>
                <ShadedButton
                  mb="md"
                  className="col-span-full rounded-lg flex flex-col gap-2"
                >
                  <div className="flex items-start gap-4">
                    <Avatar
                      size={50}
                      src={getMediaUrl(game.iconUri)}
                      className="rounded-md"
                      color={Fw.Strings.color(game.name)}
                    >
                      {Fw.Strings.initials(game.name)}
                    </Avatar>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Text size="lg" weight={500}>
                          {game.name}
                        </Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          color="gray"
                          radius="sm"
                          className="px-1.5"
                          size="lg"
                          leftSection={
                            <div className="flex items-center">
                              <HiUserAdd className="text-dimmed" />
                            </div>
                          }
                        >
                          {Fw.Nums.beautify(game._count.followers)}
                        </Badge>
                        <Badge
                          color="gray"
                          radius="sm"
                          className="px-1.5"
                          size="lg"
                          leftSection={
                            <div className="flex items-center">
                              <HiStatusOnline className="text-dimmed" />
                            </div>
                          }
                        >
                          {Fw.Nums.beautify(game.playing)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center text-center w-full">
                    {gameDetails(game)}
                  </div>
                </ShadedButton>
              </Link>
              {Object.entries(tabs).map(([key, tab]) => (
                <Link href={`/game/${game.id}/edit/v2/${key}`} key={key}>
                  <NavLink
                    label={tab.title}
                    icon={tab.icon}
                    active={key === activePage}
                    className="rounded-lg"
                  />
                </Link>
              ))}
            </SidebarTabNavigation.Sidebar>
            <SidebarTabNavigation.Content>
              <Breadcrumbs className="mb-4">
                <Link href="/invent/games">
                  <Anchor color="dimmed">Invent</Anchor>
                </Link>
                <Link href={`/game/${game.id}`}>
                  <Anchor color="dimmed">{game.name}</Anchor>
                </Link>
                <Anchor color="dimmed">Edit</Anchor>
                <Link href={`/game/${game.id}/edit/v2/${activePage}`}>
                  <Anchor color="dimmed">{route.title}</Anchor>
                </Link>
              </Breadcrumbs>
              <Section title={route.title} description={route.subtitle} />
              <Divider className="mb-8 mt-6" />
              {children}
            </SidebarTabNavigation.Content>
          </SidebarTabNavigation>
        </div>
      </div>
    </Framework>
  );
};

export default EditGame;
