import { User } from "../../util/prisma-types";
import SettingsTab from "./SettingsTab";

interface SecurityTabProps {
  user: User;
}

const SecurityTab = ({ user }: SecurityTabProps) => {
  return (
    <SettingsTab
      tabValue="security"
      tabTitle="Security"
      saveButtonLabel="Save"
      unavailable
    />
  );
};

export default SecurityTab;
