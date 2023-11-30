import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import useExperimentsStore from "@/stores/useExperimentsStore";
import usePreferences from "@/stores/usePreferences";
import { Fw } from "@/util/fw";
import boldPlugin from "@/util/fw/plugins/bold";
import linkPlugin from "@/util/fw/plugins/links";
import { getRelativeTime } from "@/util/relative-time";
import {
  ActionIcon,
  Anchor,
  Pagination,
  Spoiler,
  Text,
  Timeline,
  Tooltip,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Notification, NotificationType } from "@prisma/client";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  HiCheckCircle,
  HiDesktopComputer,
  HiExclamationCircle,
  HiGift,
  HiInformationCircle,
  HiOutlineBell,
  HiOutlineTrash,
} from "react-icons/hi";
import ReportNotificationApplet from "../notification-applets/report";

const Notifications: React.FC = () => {
  const [activePage, setActivePage] = useState(1);
  const { user, setUser } = useAuthorizedUserStore()!;
  const router = useRouter();
  const { experiments } = useExperimentsStore();
  const { preferences } = usePreferences();

  const typeIcon = (type: NotificationType) => {
    switch (type) {
      case "ALERT":
        return <HiExclamationCircle size={12} />;
      case "INFO":
        return <HiInformationCircle size={12} />;
      case "LOGIN":
        return <HiDesktopComputer size={12} />;
      case "SUCCESS":
        return <HiCheckCircle size={12} />;
      case "GIFT":
        return <HiGift size={12} />;
      case "REPORT_SUCCESS":
        return <HiCheckCircle size={12} />;
      case "REPORT_PROCESSED":
        return <HiInformationCircle size={12} />;
      default:
        return <HiInformationCircle size={12} />;
    }
  };

  const handleReadNotification = (notification: Notification) => {
    setUser({
      ...user!,
      notifications: user!.notifications.filter(
        (n) => n.id !== notification.id
      ),
    });

    fetch(`/api/notifications/${notification.id}/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    }).catch(() => alert("Error marking notification as read"));
  };
  const handleReadAllNotifications = () => {
    setUser({
      ...user!,
      notifications: [],
    });

    fetch("/api/notifications/mark-all-read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then(() => {
        showNotification({
          title: "Notifications cleared",
          message: "You have no unread notifications. Live long and prosper.",
          icon: <HiCheckCircle />,
        });
      })
      .catch(() => alert("Error marking notifications as read"));
  };

  return (
    <>
      <div className="w-full flex justify-between mb-4">
        <div className="flex gap-2">
          {preferences["@app/notification-manager"] && (
            <Tooltip label="See notification history">
              <div>
                <Link href="/notifications">
                  <ActionIcon size="lg" radius="xl" color="gray">
                    <HiOutlineBell />
                  </ActionIcon>
                </Link>
              </div>
            </Tooltip>
          )}
          <Tooltip label="Clear all notifications">
            <ActionIcon
              size="lg"
              radius="xl"
              color="red"
              onClick={() => handleReadAllNotifications()}
            >
              <HiOutlineTrash />
            </ActionIcon>
          </Tooltip>
        </div>
        <Pagination
          size="sm"
          radius="xl"
          total={Math.ceil(user?.notifications?.length! / 3)}
          page={activePage}
          onChange={setActivePage}
          align="center"
        />
      </div>

      <Timeline
        active={user?.notifications?.length}
        bulletSize={24}
        lineWidth={2}
        p={10}
      >
        {user?.notifications
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice((activePage - 1) * 3, activePage * 3)
          .map((notification) => (
            <Timeline.Item
              key={notification.id}
              bullet={typeIcon(notification.type)}
              title={notification.title}
            >
              <Spoiler
                maxHeight={43}
                showLabel="See more"
                hideLabel="Collapse"
                classNames={{
                  control: "font-semibold text-sm",
                }}
              >
                <Text color="dimmed" size="sm" className="break-words">
                  {Fw.StringParser.t(notification.message)
                    .addPlugins(boldPlugin, linkPlugin)
                    .parse()}
                </Text>
              </Spoiler>
              <ReportNotificationApplet notification={notification} />
              <Text size="xs" mt={4} color="dimmed">
                <Tooltip
                  label={new Date(notification.createdAt).toLocaleString()}
                >
                  <span>
                    {getRelativeTime(new Date(notification.createdAt))}
                  </span>
                </Tooltip>
                {" - "}
                <Anchor
                  onClick={() => handleReadNotification(notification)}
                  className="font-semibold"
                >
                  Mark as read
                </Anchor>
              </Text>
            </Timeline.Item>
          ))}
      </Timeline>
    </>
  );
};

export default Notifications;
