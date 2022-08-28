import { Alert, Checkbox, Grid } from "@mantine/core";
import { ReceiveNotification } from "@prisma/client";
import { useState } from "react";
import { HiCheckCircle } from "react-icons/hi";
import { User } from "../../util/prisma-types";
import Descriptive from "../Descriptive";
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
    [key in ReceiveNotification]: {
      title: string;
      description: string;
      label: string;
    };
  } = {
    LOGIN: {
      title: "When your account is logged in",
      description: "Receive a notification when your account is logged in",
      label: "Receive login notifications",
    },
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
      <Grid columns={2} mb={16}>
        {Object.keys(notificationDescriptions).map((key) => {
          const { title, description, label } =
            notificationDescriptions[key as ReceiveNotification];

          return (
            <Grid.Col span={1} key={key}>
              <Descriptive title={title} description={description}>
                <Checkbox
                  defaultChecked={
                    user.notificationPreferences.find(
                      (n) => n == (key as ReceiveNotification)
                    ) != null
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setUpdated([...updated, key as ReceiveNotification]);
                    } else {
                      setUpdated(
                        updated.filter((n) => n != (key as ReceiveNotification))
                      );
                    }
                  }}
                  label={label}
                />
              </Descriptive>
            </Grid.Col>
          );
        })}
      </Grid>

      {success && (
        <Alert title="Success" icon={<HiCheckCircle />} color="green">
          Saved preferences successfully.
        </Alert>
      )}
    </SettingsTab>
  );
};

export default NotificationsTab;
