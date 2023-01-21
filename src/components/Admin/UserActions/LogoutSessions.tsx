import { Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { HiLogout } from "react-icons/hi";
import performAdminAction, { AdminAction } from "../../../util/adminAction";
import { User } from "../../../util/prisma-types";
import Action from "./Action";

interface LogoutSessionsProps {
  user: User;
}

const LogoutSessions: React.FC<LogoutSessionsProps> & {
  title: string;
  description: string;
} = ({ user }) => {
  return (
    <Action
      icon={HiLogout}
      onClick={() => {
        openConfirmModal({
          title: "Confirm session clearing",
          children: (
            <Text>
              Are you sure you want to clear {user.username}&apos;s sessions?
            </Text>
          ),
          labels: {
            confirm: "Confirm",
            cancel: "Cancel",
          },
          onConfirm: async () => {
            performAdminAction(AdminAction.LOGOUT_SESSIONS, {}, user.id);
          },
        });
      }}
      title="Clear sessions"
      description="Log the user out of all their sessions"
    />
  );
};

LogoutSessions.title = "Clear sessions";
LogoutSessions.description = "Log the user out of all their sessions";

export default LogoutSessions;
