import Action from "@/components/admin/user-actions/actions";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import performAdminAction, { AdminAction } from "@/util/admin-action";
import { User } from "@/util/prisma-types";
import { Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { AdminPermission } from "@prisma/client";
import { HiShieldCheck } from "react-icons/hi";

interface ProtectedProps {
  user: User;
}

const Protected: React.FC<ProtectedProps> & {
  title: string;
  description: string;
  condition: (user: User) => boolean;
} = ({ user }) => {
  const { user: admin } = useAuthorizedUserStore();
  return (
    <Action
      icon={HiShieldCheck}
      onClick={async () => {
        openConfirmModal({
          title: "Adjust protection status",
          children: (
            <>
              <Text>
                Are you sure you want to {user.protected ? "disable" : "enable"}{" "}
                protection status for {user.username}?
              </Text>
            </>
          ),
          labels: {
            confirm: "Confirm",
            cancel: "Cancel",
          },
          confirmProps: {
            disabled: !admin?.adminPermissions.includes(
              AdminPermission.PROTECT_USERS
            ),
          },
          onConfirm: async () => {
            performAdminAction(AdminAction.ADJUST_PROTECTED, {}, user.id);
          },
        });
      }}
      title="Protect user"
      description="Adjust a users protection status"
    />
  );
};

Protected.title = "Protect user";
Protected.description = "Adjust a users protection status";
Protected.condition = () => true;

export default Protected;
