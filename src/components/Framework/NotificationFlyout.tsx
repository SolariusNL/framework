import ModernEmptyState from "@/components/ModernEmptyState";
import Notifications from "@/components/Widgets/Notifications";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import usePreferences from "@/stores/usePreferences";
import {
  Button,
  createStyles,
  Group,
  Indicator,
  Popover,
  UnstyledButton,
} from "@mantine/core";
import Link from "next/link";
import { useState } from "react";
import { HiBell, HiOutlineBell } from "react-icons/hi";

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

const NotificationFlyout: React.FC = () => {
  const [opened] = useState(false);
  const { classes, cx } = useStyles();
  const { user } = useAuthorizedUserStore()!;
  const { preferences } = usePreferences();

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
              label={user?.notifications.length}
              size={16}
              color="red"
              styles={{
                indicator: {
                  display: user?.notifications.length == 0 ? "none" : "block",
                },
              }}
              className="flex items-center justify-center"
            >
              <HiBell />
            </Indicator>
          </Group>
        </UnstyledButton>
      </Popover.Target>

      <Popover.Dropdown>
        {user?.notifications.length == 0 ? (
          <>
            <ModernEmptyState
              title="No notifications"
              body="You have no notifications"
            />
            {preferences["@app/notification-manager"] && (
              <div className="mt-4 flex justify-center">
                <Link href="/notifications">
                  <Button
                    leftIcon={<HiOutlineBell />}
                    variant="light"
                    color="gray"
                  >
                    Notification history
                  </Button>
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            <Notifications />
          </>
        )}
      </Popover.Dropdown>
    </Popover>
  );
};

export default NotificationFlyout;
