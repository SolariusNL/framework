import {
  createStyles,
  Group,
  Indicator,
  Popover,
  UnstyledButton,
} from "@mantine/core";
import { Notification } from "@prisma/client";
import { useState } from "react";
import { HiBell } from "react-icons/hi";
import ModernEmptyState from "../ModernEmptyState";
import Notifications from "../Widgets/Notifications";

interface NotificationFlyoutProps {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
}

const useStyles = createStyles((theme) => ({
  flyout: {
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
    borderRadius: theme.radius.md,
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

const NotificationFlyout = ({
  notifications,
  setNotifications,
}: NotificationFlyoutProps) => {
  const [opened, setOpened] = useState(false);
  const { classes, cx } = useStyles();

  return (
    <Popover transition="pop-top-right" width={360}>
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
              styles={{
                indicator: {
                  display: notifications.length == 0 ? "none" : "block",
                },
              }}
            >
              <HiBell />
            </Indicator>
          </Group>
        </UnstyledButton>
      </Popover.Target>

      <Popover.Dropdown>
        {notifications.length == 0 ? (
          <ModernEmptyState
            title="No notifications"
            body="You have no notifications"
          />
        ) : (
          <>
            <Notifications
              notifications={notifications}
              setNotifications={setNotifications}
            />
          </>
        )}
      </Popover.Dropdown>
    </Popover>
  );
};

export default NotificationFlyout;
