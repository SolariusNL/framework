import { Button, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { HiKey } from "react-icons/hi";
import performAdminAction, { AdminAction } from "../../../util/adminAction";
import { User } from "../../../util/prisma-types";

interface ResetPasswordProps {
  user: User;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ user }) => {
  return (
    <Button
      leftIcon={<HiKey />}
      onClick={() => {
        openConfirmModal({
          title: "Confirm password reset",
          children: (
            <Text>
              Are you sure you want to reset {user.username}&apos;s password?
              They will be asked to add a new password on their next login.
            </Text>
          ),
          labels: {
            confirm: "Confirm",
            cancel: "Cancel",
          },
          onConfirm: async () => {
            performAdminAction(AdminAction.RESET_PASSWORD, {}, user.id);
          },
        });
      }}
    >
      Reset Password
    </Button>
  );
};

export default ResetPassword;
