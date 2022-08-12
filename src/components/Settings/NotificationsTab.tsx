import { User } from "../../util/prisma-types";
import SettingsTab from "./SettingsTab";

interface NotificationsTabProps {
  user: User;
}

const NotificationsTab = ({ user }: NotificationsTabProps) => {
  return (
    <SettingsTab
      tabValue="notifications"
      tabTitle="Notifications"
      saveButtonLabel="Save"
      unavailable
    />
  );
};

export default NotificationsTab;
