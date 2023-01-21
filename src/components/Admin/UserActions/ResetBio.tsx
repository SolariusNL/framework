import { Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { HiChat } from "react-icons/hi";
import performAdminAction, { AdminAction } from "../../../util/adminAction";
import { User } from "../../../util/prisma-types";
import Action from "./Action";

interface ResetBioProps {
  user: User;
}

const ResetBio: React.FC<ResetBioProps> & {
  title: string;
  description: string;
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

export default ResetBio;
