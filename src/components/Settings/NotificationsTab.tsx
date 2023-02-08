import { Alert, Stack, Text } from "@mantine/core";
import { ReceiveNotification } from "@prisma/client";
import { useState } from "react";
import { HiCheckCircle } from "react-icons/hi";
import { User } from "../../util/prisma-types";
import SwitchCard from "../SwitchCard";
import { updateAccount } from "./AccountTab";
import SettingsTab from "./SettingsTab";

interface NotificationsTabProps {
  user: User;
}

const NotificationsTab = ({ user }: NotificationsTabProps) => {
  const [updated, setUpdated] = useState<ReceiveNotification[]>(
    user.notificationPreferences
  );
  const [success, setSuccess] = useState(false);

  const notificationDescriptions: {
    [category: string]: {
      [P in keyof typeof ReceiveNotification]?: {
        title: string;
        description: string;
        label: string;
      };
    };
  } = {
    SECURITY: {
      LOGIN: {
        title: "When your account is logged in",
        description: "Receive a notification when your account is logged in",
        label: "Receive login notifications",
      },
    },
    DONATIONS: {
      RECEIVED_DONATION: {
        title: "When you receive a donation",
        description: "Receive a notification when you receive a donation",
        label: "Receive inbound donation notifications",
      },
      SENT_DONATION: {
        title: "When you send a donation",
        description: "Receive a notification when you send a donation",
        label: "Receive outbound donation notifications",
      },
    },
    EMAILS: {
      MISSED_MESSAGES: {
        title: "When you miss messages",
        description: "Receive an email when you miss messages in a chat",
        label: "Receive missed message emails",
      },
      SERVER_OFFLINE: {
        title: "When one of your servers goes offline",
        description:
          "Receive an email when one of your Cosmic servers goes offline",
        label: "Receive server offline emails",
      },
    },
  };

  const categoryDescriptions = {
    SECURITY: "Receive notifications about your account's security",
    DONATIONS: "Receive notifications about donations",
    EMAILS: "Receive emails for important actions",
  };

  return (
    <SettingsTab
      tabValue="notifications"
      tabTitle="Notifications"
      saveButtonLabel="Save"
      saveButtonAction={(setLoading, setError) => {
        updateAccount(
          setLoading,
          setError,
          {
            notificationPreferences: updated,
          },
          setSuccess
        );
      }}
    >
      <Text mb={32}>
        Notifications ensure you&apos;re always up to date with what&apos;s
        happening on Framework. You can choose to receive notifications for a
        variety of actions, including when you receive a donation, when you miss
        a message, and when your account is logged in.
      </Text>
      <Stack mb={16}>
        {Object.keys(notificationDescriptions).map((category) => {
          return (
            <SwitchCard
              title={category.charAt(0) + category.slice(1).toLowerCase()}
              description={
                categoryDescriptions[
                  category as keyof typeof categoryDescriptions
                ]
              }
              dark
              key={category}
              data={Object.keys(notificationDescriptions[category]).map(
                (key) => {
                  const notification = notificationDescriptions[category][
                    key as keyof typeof ReceiveNotification
                  ] as { title: string; description: string; label: string };
                  return {
                    title: notification.title,
                    description: notification.description,
                    checked:
                      user.notificationPreferences.find(
                        (n) => n == (key as ReceiveNotification)
                      ) != null,
                    pointer: key,
                  };
                }
              )}
              onChange={(checked, pointer) => {
                const pointerAsKey =
                  pointer as keyof typeof ReceiveNotification;

                if (checked) {
                  setUpdated([...updated, ReceiveNotification[pointerAsKey]]);
                } else {
                  setUpdated(
                    updated.filter(
                      (n) => n != ReceiveNotification[pointerAsKey]
                    )
                  );
                }
              }}
            />
          );
        })}
      </Stack>

      {success && (
        <Alert title="Success" icon={<HiCheckCircle />} color="green">
          Saved preferences successfully.
        </Alert>
      )}
    </SettingsTab>
  );
};

export default NotificationsTab;
