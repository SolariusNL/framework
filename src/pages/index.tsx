import { Modal, Skeleton, Stack, Switch, Text } from "@mantine/core";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
import ReactNoSSR from "react-no-ssr";
import Framework from "../components/Framework";
import FeedWidget from "../components/Home/FeedWidget";
import FriendsWidget from "../components/Home/FriendsWidget";
import NotificationsWidget from "../components/Home/NotificationsWidget";
import QuickLinksWidget from "../components/Home/QuickLinksWidget";
import SubscriptionWidget from "../components/Home/SubscriptionWidget";
import ModernEmptyState from "../components/ModernEmptyState";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";

interface HomeProps {
  user: User;
}

const widgets = [
  {
    title: "Friends",
    description: "A list for easy access to your friends, and who's online.",
    id: "friends",
    component: <FriendsWidget />,
    side: "left",
  },
  {
    title: "Quick Links",
    description: "Quick access to some common pages.",
    id: "quick-links",
    component: <QuickLinksWidget />,
    side: "left",
  },
  {
    title: "Subscription Renewal",
    description: "See when your subscription renews.",
    id: "subscription",
    component: <SubscriptionWidget />,
    side: "left",
  },
  {
    title: "Feed",
    description: "A feed of your friends' status posts.",
    id: "feed",
    component: <FeedWidget />,
    side: "right",
  },
  {
    title: "Notifications",
    description: "Quick management of your notifications.",
    id: "notifications",
    component: <NotificationsWidget />,
    side: "right",
  },
];

export const widgetIds = widgets.map((widget) => widget.id);

const Home: NextPage<HomeProps> = ({ user }) => {
  const [timeMessage, setTimeMessage] = useState("");
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>(
    user.hiddenHomeWidgets
  );
  const [editWidgetsOpen, setEditWidgetsOpen] = useState(false);

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

  return (
    <Framework
      user={user}
      activeTab="home"
      modernTitle={`${timeMessage}, ${user.username}!`}
      modernSubtitle="Your experience at a glance"
      actions={[["Edit widgets", () => setEditWidgetsOpen(true)]]}
    >
      <Modal
        opened={editWidgetsOpen}
        onClose={() => setEditWidgetsOpen(false)}
        title="Edit widgets"
      >
        <Stack spacing={16}>
          {widgets.map((widget) => (
            <div className="flex items-center justify-between" key={widget.id}>
              <div onClick={() => fetch("/gert")}>
                <Text weight={500}>{widget.title}</Text>
                <Text size="sm" color="dimmed">
                  {widget.description}
                </Text>
              </div>
              <div>
                <Switch
                  defaultChecked={!hiddenWidgets.includes(widget.id)}
                  onChange={async () => {
                    setHiddenWidgets(
                      hiddenWidgets.includes(widget.id)
                        ? hiddenWidgets.filter((id) => id !== widget.id)
                        : [...hiddenWidgets, widget.id]
                    );

                    const hidden = hiddenWidgets.includes(widget.id)
                      ? hiddenWidgets.filter((id) => id !== widget.id)
                      : [...hiddenWidgets, widget.id];

                    await fetch("/api/users/@me/update", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: String(getCookie(".frameworksession")),
                      },
                      body: JSON.stringify({
                        hiddenHomeWidgets: hidden,
                      }),
                    });
                  }}
                />
              </div>
            </div>
          ))}
        </Stack>
      </Modal>
      <div className="flex flex-col md:flex-row gap-4">
        <div
          className={`flex-1 ${
            widgets
              .filter((widget) => widget.side === "left")
              .every((widget) => hiddenWidgets.includes(widget.id))
              ? "hidden"
              : ""
          }`}
        >
          <Stack spacing={12}>
            {widgets
              .filter(
                (widget) =>
                  widget.side === "left" && !hiddenWidgets.includes(widget.id)
              )
              .map((widget) => (
                <ReactNoSSR onSSR={<Skeleton height={300} />} key={widget.id}>
                  {widget.component}
                </ReactNoSSR>
              ))}
          </Stack>
        </div>
        <div
          className={`flex-1 ${
            widgets
              .filter((widget) => widget.side === "right")
              .every((widget) => hiddenWidgets.includes(widget.id))
              ? "hidden"
              : ""
          }`}
        >
          <Stack spacing={12}>
            {widgets
              .filter(
                (widget) =>
                  widget.side === "right" && !hiddenWidgets.includes(widget.id)
              )
              .map((widget) => (
                <ReactNoSSR onSSR={<Skeleton height={300} />} key={widget.id}>
                  {widget.component}
                </ReactNoSSR>
              ))}
          </Stack>
        </div>
        {widgets.every((widget) => hiddenWidgets.includes(widget.id)) && (
          <div className="flex-1">
            <ModernEmptyState
              title="No widgets"
              body="You've hidden all of your widgets. You can edit your widgets by clicking the Edit Widgets button right of the page title."
            />
          </div>
        )}
      </div>
    </Framework>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const auth = await authorizedRoute(ctx, true, false);

  if (auth.redirect) {
    return {
      redirect: {
        destination: "/landing",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: auth.props.user,
    },
  };
}

export default Home;
