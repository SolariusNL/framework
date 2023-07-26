import Framework from "@/components/Framework";
import FeedWidget from "@/components/Home/FeedWidget";
import FriendsWidget, { Section } from "@/components/Home/FriendsWidget";
import NotificationsWidget from "@/components/Home/NotificationsWidget";
import SubscriptionWidget from "@/components/Home/SubscriptionWidget";
import UpdatesWidget from "@/components/Home/UpdatesWidget";
import BioMesh from "@/components/Mesh/BioMesh";
import CatalogMesh from "@/components/Mesh/CatalogMesh";
import CreateGameMesh from "@/components/Mesh/CreateGameMesh";
import FollowMesh from "@/components/Mesh/FollowMesh";
import LikeGameMesh from "@/components/Mesh/LikeGameMesh";
import ReferMesh from "@/components/Mesh/ReferMesh";
import SidebarTabNavigation from "@/layouts/SidebarTabNavigation";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import IResponseBase from "@/types/api/IResponseBase";
import authorizedRoute from "@/util/auth";
import fetchJson from "@/util/fetch";
import { User } from "@/util/prisma-types";
import { ActionIcon, Badge, Divider, NavLink, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { openSpotlight } from "@mantine/spotlight";
import { motion } from "framer-motion";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HiBell,
  HiChat,
  HiCloud,
  HiCube,
  HiCubeTransparent,
  HiPhotograph,
  HiSearch,
  HiShare,
  HiShoppingCart,
  HiSparkles,
  HiUserAdd,
  HiUsers,
  HiX,
  HiXCircle,
} from "react-icons/hi";
import Landing from "./landing";

interface HomeProps {
  user: User;
}

const Home: NextPage<HomeProps> = ({ user: u }) => {
  const [timeMessage, setTimeMessage] = useState("");
  const { user, setProperty } = useAuthorizedUserStore();

  const widgets = [
    {
      title: "Friends",
      description: "A list for easy access to your friends, and who's online.",
      id: "friends",
      component: <FriendsWidget />,
      side: "left",
      icon: <HiUsers />,
    },
    {
      title: "Spotlight",
      description: "Quick access to different parts of Framework.",
      id: "quick-links",
      component: <></>,
      side: "left",
      icon: <HiSearch />,
      onClick: () => openSpotlight(),
    },
    {
      title: "Games",
      description: "List of games curated for you.",
      id: "subscription",
      component: <SubscriptionWidget />,
      side: "left",
      icon: <HiSparkles />,
    },
    {
      title: "Feed",
      description: "A feed of your friends' status posts.",
      id: "feed",
      component: <FeedWidget />,
      side: "right",
      icon: <HiChat />,
    },
    {
      title: "Updates",
      description: "See updates from games you follow.",
      id: "updates",
      component: <UpdatesWidget />,
      side: "right",
      icon: <HiCloud />,
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
          <HiBell />
        ),
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

  return u ? (
    <Framework
      user={u}
      activeTab="home"
      modernTitle={`${timeMessage}, ${u.username}!`}
      modernSubtitle="Your experience at a glance"
    >
      <SidebarTabNavigation>
        <SidebarTabNavigation.Sidebar>
          {widgets.map((widget) => (
            <NavLink
              label={widget.title}
              description={widget.description}
              icon={widget.icon}
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
                      complete: user?._count.following! > 0,
                      icon: <HiUserAdd />,
                      href: "/social",
                    },
                    {
                      component: BioMesh,
                      label: "Create your profile",
                      description:
                        "Tell us a little about yourself so your friends can get to know you.",
                      complete:
                        user?.bio !== null &&
                        user?.bio !== "This user has not yet written a bio." &&
                        user?.bio !== "",
                      icon: <HiPhotograph />,
                      href: "/settings/account",
                    },
                    {
                      component: LikeGameMesh,
                      label: "Like some games",
                      description:
                        "Like some games to get recommendations and updates.",
                      complete: false,
                      icon: <HiCube />,
                      href: "/games",
                    },
                    {
                      component: CatalogMesh,
                      label: "Browse the catalog",
                      description:
                        "Browse the catalog to customize your avatar and more.",
                      complete: false,
                      icon: <HiShoppingCart />,
                      href: "/catalog",
                    },
                    {
                      component: ReferMesh,
                      label: "Refer your friends",
                      description:
                        "Refer your friends to earn rewards and help us grow.",
                      complete: false,
                      icon: <HiShare />,
                      href: "/settings/referrals",
                    },
                    {
                      component: CreateGameMesh,
                      label: "Create your first game",
                      description:
                        "Create your first game to start building your community.",
                      complete: false,
                      icon: <HiCubeTransparent />,
                      href: "/invent/games",
                    },
                  ]
                    .filter((step) => !step.complete)
                    .map((step) => (
                      <Link href={step.href} key={step.label}>
                        <motion.div
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                          }}
                          whileHover={{ scale: 1.02 }}
                          className="flex flex-col gap-2 cursor-pointer"
                        >
                          <step.component className="p-8 rounded-md px-20 flex items-center text-center justify-center">
                            <div className="text-white text-2xl">
                              {step.icon}
                            </div>
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
