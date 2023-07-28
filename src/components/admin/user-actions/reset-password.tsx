import Action from "@/components/admin/user-actions/actions";
import performAdminAction, { AdminAction } from "@/util/admin-action";
import { User } from "@/util/prisma-types";
import { Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { HiKey } from "react-icons/hi";

interface ResetPasswordProps {
  user: User;
}

const ResetPassword: React.FC<ResetPasswordProps> & {
  title: string;
  description: string;
  condition: (user: User) => boolean;
} = ({ user }) => {
  return (
    <Action
      icon={HiKey}
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
      title="Reset password"
      description="Reset the user's password. They will be emailed a randomly generated password."
      condition={user.passwordResetRequired}
    />
  );
};

ResetPassword.title = "Reset password";
ResetPassword.description =
  "Reset the user's password. They will be asked to add a new password on their visit.";
ResetPassword.condition = (user) => !user.passwordResetRequired;

export default ResetPassword;
