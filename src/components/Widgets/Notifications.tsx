import { Anchor, Pagination, Spoiler, Text, Timeline } from "@mantine/core";
import { Notification, NotificationType } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useState } from "react";
import {
  HiCheckCircle,
  HiDesktopComputer,
  HiExclamationCircle,
  HiInformationCircle,
} from "react-icons/hi";
import { getRelativeTime } from "../../util/relativeTime";
import useMediaQuery from "../../util/useMediaQuery";

interface NotificationProps {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
}

const Notifications: React.FC<NotificationProps> = ({
  notifications,
  setNotifications,
}) => {
  const [activePage, setActivePage] = useState(1);

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
      default:
        return <HiInformationCircle size={12} />;
    }
  };

  const handleReadNotification = (notification: Notification) => {
    setNotifications(notifications.filter((n) => n.id !== notification.id));

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
          total={Math.ceil(notifications.length / (mobile ? 3 : 5))}
          page={activePage}
          onChange={setActivePage}
          align="center"
        />
      </div>

      <Timeline
        active={notifications.length}
        bulletSize={24}
        lineWidth={2}
        p={10}
      >
        {notifications
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice((activePage - 1) * (mobile ? 3 : 5), activePage * 5)
          .map((notification) => (
            <Timeline.Item
              key={notification.id}
              bullet={typeIcon(notification.type)}
              title={notification.title}
            >
              <Spoiler maxHeight={40} showLabel="See more" hideLabel="Collapse">
                <Text color="dimmed" size="sm">
                  {notification.message}
                </Text>
              </Spoiler>
              <Text size="xs" mt={4}>
                {getRelativeTime(new Date(notification.createdAt))}
                {" - "}
                <Anchor onClick={() => handleReadNotification(notification)}>
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
