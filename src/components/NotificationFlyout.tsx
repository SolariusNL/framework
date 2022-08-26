import {
  Anchor,
  createStyles,
  Group,
  Indicator,
  Pagination,
  Popover,
  Spoiler,
  Text,
  Timeline,
  UnstyledButton,
} from "@mantine/core";
import { Notification, NotificationType } from "@prisma/client";
import { useState } from "react";
import {
  HiBell,
  HiCheckCircle,
  HiDesktopComputer,
  HiExclamationCircle,
  HiInformationCircle,
  HiPhone,
} from "react-icons/hi";
import { getCookie } from "../util/cookies";
import { getRelativeTime } from "../util/relativeTime";
import EmptyState from "./EmptyState";

interface NotificationFlyoutProps {
  notificationData: Notification[];
}

const useStyles = createStyles((theme) => ({
  flyout: {
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
    borderRadius: theme.radius.sm,
    transition: "background-color 100ms ease",

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
    },
  },

  flyoutActive: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
  },
}));

const NotificationFlyout = ({ notificationData }: NotificationFlyoutProps) => {
  const [opened, setOpened] = useState(false);
  const { classes, cx, theme } = useStyles();

  const [notifications, setNotifications] = useState(notificationData);
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

  return (
    <Popover transition="pop-top-right">
      <Popover.Target>
        <UnstyledButton
          className={cx(classes.flyout, {
            [classes.flyoutActive]: opened,
          })}
        >
          <Group spacing={6}>
            <Indicator
              inline
              label={notifications.length}
              size={16}
              color="red"
            >
              <HiBell />
            </Indicator>
          </Group>
        </UnstyledButton>
      </Popover.Target>

      <Popover.Dropdown>
        {notifications.length == 0 ? (
          <EmptyState
            title="No notifications"
            body="You have no notifications"
          />
        ) : (
          <>
            <Group sx={{ width: "100%", justifyContent: "center" }} mb={16}>
              <Pagination
                size="sm"
                radius="xl"
                withEdges
                total={Math.ceil(notifications.length / 5)}
                page={activePage}
                onChange={setActivePage}
                align="center"
              />
            </Group>

            <Timeline
              active={notifications.length}
              bulletSize={24}
              lineWidth={2}
              p={10}
              sx={{
                maxWidth: "360px",
              }}
            >
              {notifications
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .slice((activePage - 1) * 5, activePage * 5)
                .map((notification) => (
                  <Timeline.Item
                    key={notification.id}
                    bullet={typeIcon(notification.type)}
                    title={notification.title}
                  >
                    <Spoiler
                      maxHeight={40}
                      showLabel="See more"
                      hideLabel="Collapse"
                    >
                      <Text color="dimmed" size="sm">
                        {notification.message}
                      </Text>
                    </Spoiler>
                    <Text size="xs" mt={4}>
                      {getRelativeTime(new Date(notification.createdAt))}
                      {" - "}
                      <Anchor
                        onClick={() => handleReadNotification(notification)}
                      >
                        Mark as read
                      </Anchor>
                    </Text>
                  </Timeline.Item>
                ))}
            </Timeline>
          </>
        )}
      </Popover.Dropdown>
    </Popover>
  );
};

export default NotificationFlyout;
