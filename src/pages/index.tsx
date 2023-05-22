import { Badge, NavLink } from "@mantine/core";
import { openSpotlight } from "@mantine/spotlight";
import { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
import {
  HiBell,
  HiChat,
  HiCloud,
  HiSearch,
  HiSparkles,
  HiUsers,
} from "react-icons/hi";
import Framework from "../components/Framework";
import FeedWidget from "../components/Home/FeedWidget";
import FriendsWidget from "../components/Home/FriendsWidget";
import NotificationsWidget from "../components/Home/NotificationsWidget";
import SubscriptionWidget from "../components/Home/SubscriptionWidget";
import UpdatesWidget from "../components/Home/UpdatesWidget";
import SidebarTabNavigation from "../layouts/SidebarTabNavigation";
import authorizedRoute from "../util/auth";
import { Fw } from "../util/fw";
import { User } from "../util/prisma-types";

interface HomeProps {
  user: User;
}

const Home: NextPage<HomeProps> = ({ user }) => {
  const [timeMessage, setTimeMessage] = useState("");
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
        user.notifications.length > 0 ? (
          <Badge
            size="xs"
            variant="filled"
            color="red"
            sx={{ width: 16, height: 16, padding: 0 }}
          >
            {user.notifications.length}
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

  return (
    <Framework
      user={user}
      activeTab="home"
      modernTitle={`${timeMessage}, ${user.username}!`}
      modernSubtitle="Your experience at a glance"
    >
      {JSON.stringify(Fw.Feature.enabled(Fw.FeatureIdentifier.Domains))}
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
          {widgets[activeIndex].component}
        </SidebarTabNavigation.Content>
      </SidebarTabNavigation>
    </Framework>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const auth = await authorizedRoute(ctx, true, false);

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
      user: auth.props?.user,
    },
  };
}

export default Home;
