import { Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { HiX } from "react-icons/hi";
import performAdminAction, { AdminAction } from "../../../util/adminAction";
import { User } from "../../../util/prisma-types";
import Action from "./Action";

interface UnwarnProps {
  user: User;
}

const Unwarn: React.FC<UnwarnProps> & {
  title: string;
  description: string;
  condition: (user: User) => boolean;
} = ({ user }) => {
  return (
    <Action
      icon={HiX}
      onClick={async () => {
        openConfirmModal({
          title: "Confirm Unwarn",
          children: (
            <>
              <Text>Are you sure you want to unwarn {user.username}?</Text>
            </>
          ),
          labels: {
            confirm: "Confirm",
            cancel: "Cancel",
          },
          onConfirm: async () => {
            performAdminAction(AdminAction.UNWARN, {}, user.id);
          },
        });
      }}
      title="Unwarn user"
      description="Unwarn a user from Framework"
    />
  );
};

Unwarn.title = "Unwarn user";
Unwarn.description = "Unwarn a user from Framework";
Unwarn.condition = (user) => true;

export default Unwarn;
