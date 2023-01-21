import { Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { HiClock } from "react-icons/hi";
import performAdminAction, { AdminAction } from "../../../util/adminAction";
import { User } from "../../../util/prisma-types";
import Action from "./Action";

interface ResetUsernameProps {
  user: User;
}

const ResetUsername: React.FC<ResetUsernameProps> & {
  title: string;
  description: string;
} = ({ user }) => {
  return (
    <Action
      icon={HiClock}
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
      title="Reset username"
      description="Reset the user's username. A random username will be generated for them."
    />
  );
};

ResetUsername.title = "Reset username";
ResetUsername.description =
  "Reset the user's username. A random username will be generated for them.";

export default ResetUsername;
