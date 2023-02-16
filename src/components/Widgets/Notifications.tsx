import {
  Anchor,
  Pagination,
  Spoiler,
  Text,
  Timeline,
  Tooltip,
} from "@mantine/core";
import { Notification, NotificationType } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useState } from "react";
import {
  HiCheckCircle,
  HiDesktopComputer,
  HiExclamationCircle,
  HiGift,
  HiInformationCircle,
} from "react-icons/hi";
import useAuthorizedUserStore from "../../stores/useAuthorizedUser";
import { getRelativeTime } from "../../util/relativeTime";
import useMediaQuery from "../../util/useMediaQuery";

const Notifications: React.FC = () => {
  const [activePage, setActivePage] = useState(1);
  const { user, setUser } = useAuthorizedUserStore()!;

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

  const mobile = useMediaQuery("768");

  return (
    <>
      <div className="w-full flex justify-center mb-4">
        <Pagination
          size="sm"
          radius="xl"
          withEdges
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
                <Text color="dimmed" size="sm">
                  {notification.message}
                </Text>
              </Spoiler>
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
