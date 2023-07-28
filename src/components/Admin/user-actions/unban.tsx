import Action from "@/components/admin/user-actions/actions";
import performAdminAction, { AdminAction } from "@/util/admin-action";
import { User } from "@/util/prisma-types";
import { Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { HiX } from "react-icons/hi";

interface UnbanProps {
  user: User;
}

const Unban: React.FC<UnbanProps> & {
  title: string;
  description: string;
  condition: (user: User) => boolean;
} = ({ user }) => {
  return (
    <Action
      icon={HiX}
      onClick={async () => {
        openConfirmModal({
          title: "Confirm unban",
          children: (
            <>
              <Text>
                Are you sure you want to unban {user.username}? They will be
                allowed to access Framework.
              </Text>
            </>
          ),
          labels: {
            confirm: "Confirm",
            cancel: "Cancel",
          },
          onConfirm: async () => {
            performAdminAction(AdminAction.UNBAN, {}, user.id);
          },
        });
      }}
      title="Unban user"
      description="Unban a user from Framework"
      condition={!user.banned}
    />
  );
};

Unban.title = "Unban user";
Unban.description = "Unban a user from Framework";
Unban.condition = (user) => !user.banned;

export default Unban;
