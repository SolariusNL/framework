import { Button, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { HiChat, HiKey } from "react-icons/hi";
import performAdminAction, { AdminAction } from "../../../util/adminAction";
import { User } from "../../../util/prisma-types";

interface ResetBioProps {
  user: User;
}

const ResetBio: React.FC<ResetBioProps> = ({ user }) => {
  return (
    <Button
      leftIcon={<HiChat />}
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
    >
      Reset bio
    </Button>
  );
};

export default ResetBio;
