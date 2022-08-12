import { User } from "../../util/prisma-types";
import SettingsTab from "./SettingsTab";

interface DeleteAccountTabProps {
  user: User;
}

const DeleteAccountTab = ({ user }: DeleteAccountTabProps) => {
  return (
    <SettingsTab
      tabValue="deleteaccount"
      tabTitle="Delete Account"
      unavailable
    />
  );
};

export default DeleteAccountTab;
