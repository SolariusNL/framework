import { Button, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { HiLogout } from "react-icons/hi";
import performAdminAction, { AdminAction } from "../../../util/adminAction";
import { User } from "../../../util/prisma-types";

interface LogoutSessionsProps {
  user: User;
}

const LogoutSessions: React.FC<LogoutSessionsProps> = ({ user }) => {
  return (
    <Button
      leftIcon={<HiLogout />}
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
    >
      Clear Sessions
    </Button>
  );
};

export default LogoutSessions;