import Action from "@/components/admin/user-actions/actions";
import performAdminAction, { AdminAction } from "@/util/admin-action";
import { User } from "@/util/prisma-types";
import { Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { HiLogout } from "react-icons/hi";

interface LogoutSessionsProps {
  user: User;
}

const LogoutSessions: React.FC<LogoutSessionsProps> & {
  title: string;
  description: string;
  condition: (user: User) => boolean;
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
LogoutSessions.condition = (user) => true;

export default LogoutSessions;
