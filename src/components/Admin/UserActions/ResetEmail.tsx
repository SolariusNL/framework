import { Button, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { HiMail } from "react-icons/hi";
import performAdminAction, { AdminAction } from "../../../util/adminAction";
import { User } from "../../../util/prisma-types";

interface ResetEmailProps {
  user: User;
}

const ResetEmail: React.FC<ResetEmailProps> = ({ user }) => {
  return (
    <Button
      leftIcon={<HiMail />}
      onClick={() => {
        openConfirmModal({
          title: "Confirm email reset",
          children: (
            <Text>
              Are you sure you want to reset {user.username}&apos;s email? They
              will be asked to add a new email on their next login.
            </Text>
          ),
          labels: {
            confirm: "Confirm",
            cancel: "Cancel",
          },
          onConfirm: async () => {
            performAdminAction(AdminAction.RESET_EMAIL, {}, user.id);
          },
        });
      }}
    >
      Reset Email
    </Button>
  );
};

export default ResetEmail;
