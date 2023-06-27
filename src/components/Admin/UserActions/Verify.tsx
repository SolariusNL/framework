import Action from "@/components/Admin/UserActions/Action";
import performAdminAction, { AdminAction } from "@/util/admin-action";
import { User } from "@/util/prisma-types";
import { Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { HiCheckCircle } from "react-icons/hi";

interface VerifyProps {
  user: User;
}

const Verify: React.FC<VerifyProps> & {
  title: string;
  description: string;
  condition: (user: User) => boolean;
} = ({ user }) => {
  return (
    <Action
      icon={HiCheckCircle}
      onClick={async () => {
        openConfirmModal({
          title: "Adjust verification",
          children: (
            <>
              <Text>
                Are you sure you want to {user.verified ? "unverify" : "verify"}{" "}
                {user.username}? Verification status will be immediately
                adjusted.
              </Text>
            </>
          ),
          labels: {
            confirm: "Confirm",
            cancel: "Cancel",
          },
          onConfirm: async () => {
            performAdminAction(AdminAction.ADJUST_VERIFICATION, {}, user.id);
          },
        });
      }}
      title="Verify user"
      description="Adjust a users verification status"
    />
  );
};

Verify.title = "Verify user";
Verify.description = "Adjust a users verification status";
Verify.condition = () => true;

export default Verify;
