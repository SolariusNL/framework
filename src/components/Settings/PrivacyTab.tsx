import { User } from "../../util/prisma-types";
import SettingsTab from "./SettingsTab";

interface PrivacyTabProps {
  user: User;
}

const PrivacyTab = ({ user }: PrivacyTabProps) => {
  return (
    <SettingsTab
      tabValue="privacy"
      tabTitle="Privacy"
      saveButtonLabel="Save"
      unavailable
    />
  );
};

export default PrivacyTab;
