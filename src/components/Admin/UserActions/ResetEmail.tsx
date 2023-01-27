import { Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { HiMail } from "react-icons/hi";
import performAdminAction, { AdminAction } from "../../../util/adminAction";
import { User } from "../../../util/prisma-types";
import Action from "./Action";

interface ResetEmailProps {
  user: User;
}

const ResetEmail: React.FC<ResetEmailProps> & {
  title: string;
  description: string;
  condition: (user: User) => boolean;
} = ({ user }) => {
  return (
    <Action
      icon={HiMail}
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
      title="Reset email"
      description="Reset the user's email. They will be asked to add a new email on their visit."
      condition={!user.emailResetRequired}
    />
  );
};

ResetEmail.title = "Reset email";
ResetEmail.description =
  "Reset the user's email. They will be asked to add a new email on their visit.";
ResetEmail.condition = (user) => !user.emailResetRequired;

export default ResetEmail;
