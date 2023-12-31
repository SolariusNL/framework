import Action from "@/components/admin/user-actions/actions";
import performAdminAction, { AdminAction } from "@/util/admin-action";
import { User } from "@/util/prisma-types";
import { Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { HiChat } from "react-icons/hi";

interface ResetBioProps {
  user: User;
}

const ResetBio: React.FC<ResetBioProps> & {
  title: string;
  description: string;
  condition: (user: User) => boolean;
} = ({ user }) => {
  return (
    <Action
      icon={HiChat}
      onClick={() => {
        openConfirmModal({
          title: "Confirm bio reset",
          children: (
            <Text>
              Are you sure you want to reset {user.username}&apos;s bio?
            </Text>
          ),
          labels: {
            confirm: "Confirm",
            cancel: "Cancel",
          },
          onConfirm: async () => {
            performAdminAction(AdminAction.RESET_BIO, {}, user.id);
          },
        });
      }}
      title="Reset bio"
      description="Reset the user's bio"
    />
  );
};

ResetBio.title = "Reset bio";
ResetBio.description = "Reset the user's bio";
ResetBio.condition = (user) => true;

export default ResetBio;
