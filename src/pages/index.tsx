import Framework from "@/components/framework";
import FeedWidget from "@/components/home/feed";
import FriendsWidget, { Section } from "@/components/home/friends";
import NotificationsWidget from "@/components/home/notifications";
import SubscriptionWidget from "@/components/home/subscription";
import UpdatesWidget from "@/components/home/updates";
import BioMesh from "@/components/mesh/bio";
import CatalogMesh from "@/components/mesh/catalog";
import CreateGameMesh from "@/components/mesh/create-game";
import FollowMesh from "@/components/mesh/follow";
import LikeGameMesh from "@/components/mesh/like-game";
import ReferMesh from "@/components/mesh/refer";
import SidebarTabNavigation from "@/layouts/SidebarTabNavigation";
import Landing from "@/pages/landing";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import useExperimentsStore, {
  ExperimentId,
} from "@/stores/useExperimentsStore";
import { Flow } from "@/stores/useFlow";
import usePreferences from "@/stores/usePreferences";
import IResponseBase from "@/types/api/IResponseBase";
import authorizedRoute from "@/util/auth";
import fetchJson from "@/util/fetch";
import { Fw } from "@/util/fw";
import { Preferences } from "@/util/preferences";
import prisma from "@/util/prisma";
import { User } from "@/util/prisma-types";
import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  NavLink,
  Text,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { openSpotlight } from "@mantine/spotlight";
import { motion } from "framer-motion";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  HiBell,
  HiChatAlt,
  HiCloud,
  HiCube,
  HiCubeTransparent,
  HiOutlineBell,
  HiOutlineChatAlt,
  HiOutlineCloud,
  HiOutlineSearch,
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiPhotograph,
  HiSearch,
  HiShare,
  HiShoppingCart,
  HiSparkles,
  HiUserAdd,
  HiUserGroup,
  HiX,
  HiXCircle,
} from "react-icons/hi";
import NoSSR from "react-no-ssr";

interface HomeProps {
  user: User;
}

const Home: NextPage<HomeProps> = ({ user: u }) => {
  const [timeMessage, setTimeMessage] = useState("");
  const { user, setProperty } = useAuthorizedUserStore();
  const { experiments } = useExperimentsStore();

  const widgets = [
    {
      title: "Friends",
      description: "A list for easy access to your friends, and who's online.",
      id: "friends",
      component: <FriendsWidget />,
      side: "left",
      icon: <HiOutlineUserGroup />,
      activeIcon: <HiUserGroup />,
    },
    {
      title: "Spotlight",
      description: "Quick access to different parts of Framework.",
      id: "quick-links",
      component: <></>,
      side: "left",
      icon: <HiOutlineSearch />,
      activeIcon: <HiSearch />,
      onClick: () => openSpotlight(),
    },
    {
      title: "Games",
      description: "List of games curated for you.",
      id: "subscription",
      component: <SubscriptionWidget />,
      side: "left",
      icon: <HiOutlineSparkles />,
      activeIcon: <HiSparkles />,
    },
    {
      title: "Feed",
      description: "A feed of your friends' status posts.",
      id: "feed",
      component: <FeedWidget />,
      side: "right",
      icon: <HiOutlineChatAlt />,
      activeIcon: <HiChatAlt />,
    },
    {
      title: "Updates",
      description: "See updates from games you follow.",
      id: "updates",
      component: <UpdatesWidget />,
      side: "right",
      icon: <HiOutlineCloud />,
      activeIcon: <HiCloud />,
    },
    {
      title: "Notifications",
      description: "Quick management of your notifications.",
      id: "notifications",
      component: <NotificationsWidget />,
      side: "right",
      icon:
        u && u.notifications.length! > 0 ? (
          <Badge
            size="xs"
            variant="filled"
            color="red"
            sx={{ width: 16, height: 16, padding: 0 }}
          >
            {u.notifications.length}
          </Badge>
        ) : (
          <HiOutlineBell />
        ),
      activeIcon: <HiBell />,
    },
  ];

  useEffect(() => {
    setTimeMessage(
      new Date().getHours() < 12
        ? "Good morning"
        : new Date().getHours() < 18
        ? "Good afternoon"
        : new Date().getHours() < 22
        ? "Good evening"
        : "Good night"
    );
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const prefStore = usePreferences();
  const router = useRouter();

  return u ? (
    <Framework
      user={u}
      activeTab="home"
      modernTitle={`${timeMessage}, ${u.username}!`}
      modernSubtitle="Your experience at a glance"
    >
      <SidebarTabNavigation>
        <SidebarTabNavigation.Sidebar>
          <NoSSR>
            {prefStore.preferences["@user/seen-roblox-convert"] !== true &&
              experiments.includes(ExperimentId.RobloxAuth) && (
                <div className="p-3 overflow-hidden relative w-full rounded-md mb-4">
                  <CatalogMesh className="absolute top-0 left-0 w-full h-full" />
                  <div className="flex flex-col gap-2 relative text-white">
                    <div className="flex justify-between gap-2 items-start">
                      <Title order={3}>Convert your Robux to Tickets</Title>
                      <ActionIcon
                        radius="xl"
                        size="sm"
                        className="text-white"
                        onClick={() =>
                          Preferences.setPreferences({
                            "@user/seen-roblox-convert": true,
                          })
                        }
                      >
                        <HiX />
                      </ActionIcon>
                    </div>
                    <Text size="sm" className="font-title">
                      Connect your Roblox account to Framework to convert your
                      Robux to Tickets at a{" "}
                      <span className="font-bold">1:1</span> ratio.
                    </Text>
                    <Button
                      fullWidth
                      color="pink"
                      className="border-0 mt-2"
                      onClick={() =>
                        Fw.Flows.toggleFlow(Flow.RobloxAuth, router)
                      }
                    >
                      Get started
                    </Button>
                  </div>
                </div>
              )}
          </NoSSR>
          {widgets.map((widget) => (
            <NavLink
              label={widget.title}
              description={widget.description}
              icon={
                activeIndex === widgets.indexOf(widget)
                  ? widget.activeIcon
                  : widget.icon
              }
              key={widget.id}
              active={activeIndex === widgets.indexOf(widget)}
              onClick={() => {
                if (widget.onClick) widget.onClick();
                else setActiveIndex(widgets.indexOf(widget));
              }}
              className="rounded-md h-fit"
            />
          ))}
        </SidebarTabNavigation.Sidebar>
        <SidebarTabNavigation.Content>
          {typeof window !== "undefined" &&
            user &&
            !user.gettingStartedDismissed && (
              <>
                <Section
                  title="Getting started"
                  description="Welcome to Framework! Here are some things to get you started."
                  right={
                    <ActionIcon
                      className="rounded-full transition-all hover:border-zinc-500/50"
                      sx={{ borderWidth: 1 }}
                      onClick={async () => {
                        setProperty("gettingStartedDismissed", true);
                        await fetchJson<IResponseBase>(
                          "/api/users/@me/update",
                          {
                            auth: true,
                            body: {
                              gettingStartedDismissed: true,
                            },
                            method: "POST",
                          }
                        ).then((res) => {
                          if (!res.success) {
                            showNotification({
                              title: "Error",
                              message:
                                "We couldn't dismiss the getting started message. Please try again later.",
                              icon: <HiXCircle />,
                              color: "red",
                            });
                          }
                        });
                      }}
                      size="xl"
                    >
                      <HiX />
                    </ActionIcon>
                  }
                />
                <div className="grid md:grid-cols-3 grid-cols-2 gap-3 gap-y-6">
                  {[
                    {
                      component: FollowMesh,
                      label: "Follow your friends",
                      description:
                        "Follow your friends to play together and chat.",
                      icon: <HiUserAdd />,
                      href: "/social",
                    },
                    {
                      component: BioMesh,
                      label: "Create your profile",
                      description:
                        "Tell us a little about yourself so your friends can get to know you.",
                      icon: <HiPhotograph />,
                      href: "/settings/account",
                    },
                    {
                      component: LikeGameMesh,
                      label: "Like some games",
                      description:
                        "Like some games to get recommendations and updates.",
                      icon: <HiCube />,
                      href: "/games",
                    },
                    {
                      component: CatalogMesh,
                      label: "Browse the catalog",
                      description:
                        "Browse the catalog to customize your avatar and more.",
                      icon: <HiShoppingCart />,
                      href: "/catalog",
                    },
                    {
                      component: ReferMesh,
                      label: "Refer your friends",
                      description:
                        "Refer your friends to earn rewards and help us grow.",
                      icon: <HiShare />,
                      href: "/settings/referrals",
                    },
                    {
                      component: CreateGameMesh,
                      label: "Create your first game",
                      description:
                        "Create your first game to start building your community.",
                      icon: <HiCubeTransparent />,
                      href: "/invent/games",
                    },
                  ].map((step) => (
                    <Link href={step.href} key={step.label}>
                      <motion.div
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex flex-col gap-2 cursor-pointer"
                      >
                        <step.component className="p-8 rounded-md px-20 flex items-center text-center justify-center">
                          <div className="text-white text-2xl">{step.icon}</div>
                        </step.component>
                        <Text size="sm" weight={500}>
                          {step.label}
                        </Text>
                        <Text size="sm" color="dimmed">
                          {step.description}
                        </Text>
                      </motion.div>
                    </Link>
                  ))}
                </div>
                <Divider mt="xl" mb="xl" />
              </>
            )}
          {widgets[activeIndex].component}
        </SidebarTabNavigation.Content>
      </SidebarTabNavigation>
    </Framework>
  ) : (
    <Landing />
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const setup = await prisma.appConfig.findUnique({
    where: {
      id: "did-setup",
    },
  });

  if (setup && setup.value === "false") {
    return {
      redirect: {
        destination: "/setup",
        permanent: false,
      },
    };
  }

  const auth = await authorizedRoute(ctx, false, false);

  if (auth.redirect && !auth.redirect.banRedirect)
    return {
      redirect: {
        destination: "/landing",
        permanent: false,
      },
    };
  else if (auth.redirect && auth.redirect.banRedirect) return auth;

  return {
    props: {
      user: auth.props?.user || null,
    },
  };
}

export default Home;
