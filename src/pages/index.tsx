import { Badge, NavLink } from "@mantine/core";
import { openSpotlight } from "@mantine/spotlight";
import { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
import {
  HiBell,
  HiChat,
  HiCloud,
  HiLink,
  HiSearch,
  HiSparkles,
  HiUsers,
} from "react-icons/hi";
import Framework from "../components/Framework";
import FeedWidget from "../components/Home/FeedWidget";
import FriendsWidget from "../components/Home/FriendsWidget";
import NotificationsWidget from "../components/Home/NotificationsWidget";
import QuickLinksWidget from "../components/Home/QuickLinksWidget";
import SubscriptionWidget from "../components/Home/SubscriptionWidget";
import UpdatesWidget from "../components/Home/UpdatesWidget";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";
import useMediaQuery from "../util/useMediaQuery";

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
  const mobile = useMediaQuery("768");

  return (
    <Framework
      user={user}
      activeTab="home"
      modernTitle={`${timeMessage}, ${user.username}!`}
      modernSubtitle="Your experience at a glance"
    >
      <div className="flex flex-col md:flex-row gap-8">
        <div
          className="md:flex md:flex-col md:gap-2 flex-row grid grid-cols-2 gap-2 md:grid-cols-1 md:grid-rows-3"
          {...(!mobile && { style: { width: 240 } })}
        >
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
              className="rounded-md"
            />
          ))}
        </div>
        <div className="flex-1">{widgets[activeIndex].component}</div>
      </div>
    </Framework>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const auth = await authorizedRoute(ctx, true, false);

  if (auth.redirect) return auth;

  return {
    props: {
      user: auth.props.user,
    },
  };
}

export default Home;
