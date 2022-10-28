import { Alert, Checkbox, Stack } from "@mantine/core";
import { ReceiveNotification } from "@prisma/client";
import { useState } from "react";
import { HiCheckCircle } from "react-icons/hi";
import { User } from "../../util/prisma-types";
import Descriptive from "../Descriptive";
import { updateAccount } from "./AccountTab";
import Grouped from "./Grouped";
import SettingsTab from "./SettingsTab";
import SideBySide from "./SideBySide";

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
      <Stack mb={32}>
        {Object.keys(notificationDescriptions).map((category) => {
          return (
            <Grouped
              title={category.charAt(0) + category.slice(1).toLowerCase()}
              key={category}
            >
              {Object.keys(notificationDescriptions[category]).map((key) => {
                const notification = notificationDescriptions[category][
                  key as keyof typeof ReceiveNotification
                ] as { title: string; description: string; label: string };

                return (
                  <SideBySide
                    title={notification.title}
                    description={notification.description}
                    key={key}
                    shaded
                    noUpperBorder
                    right={
                      <Descriptive
                        title={notification.title}
                        description={notification.description}
                      >
                        <Checkbox
                          defaultChecked={
                            user.notificationPreferences.find(
                              (n) => n == (key as ReceiveNotification)
                            ) != null
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setUpdated([
                                ...updated,
                                key as ReceiveNotification,
                              ]);
                            } else {
                              setUpdated(
                                updated.filter(
                                  (n) => n != (key as ReceiveNotification)
                                )
                              );
                            }
                          }}
                          label={notification.label}
                        />
                      </Descriptive>
                    }
                  />
                );
              })}
            </Grouped>
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
