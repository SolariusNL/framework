import { Button, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { HiClock } from "react-icons/hi";
import performAdminAction, { AdminAction } from "../../../util/adminAction";
import { User } from "../../../util/prisma-types";

interface ResetUsernameProps {
  user: User;
}

const ResetUsername: React.FC<ResetUsernameProps> = ({ user }) => {
  return (
    <Button
      leftIcon={<HiClock />}
      onClick={async () => {
        openConfirmModal({
          title: "Confirm username reset",
          children: (
            <>
              <Text>
                Are you sure you want to reset {user.username}&apos;s username?
                A random username will be generated for them.
              </Text>
            </>
          ),
          labels: {
            confirm: "Confirm",
            cancel: "Cancel",
          },
          onConfirm: async () => {
            performAdminAction(AdminAction.RESET_USERNAME, {}, user.id);
          },
        });
      }}
    >
      Reset Username
    </Button>
  );
};

export default ResetUsername;
