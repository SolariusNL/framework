import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import { Button, Modal, Text } from "@mantine/core";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { FC } from "react";

const WarningModal: FC = () => {
  const { user } = useAuthorizedUserStore();
  const router = useRouter();

  const acknowledgeWarning = async () => {
    fetch("/api/users/@me/warning/acknowledge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    }).then(() => router.reload());
  };

  return (
    <Modal
      withCloseButton={false}
      opened={user?.warning !== ""}
      onClose={() => null}
    >
      <Text mb={16}>
        You have received a warning from the staff team:{" "}
        <span className="font-semibold">
          {user?.warning ?? "Unknown reason"}
        </span>
      </Text>

      <Text mb={24}>
        If you continue to violate our Community Guidelines, you may be
        permanently banned from Framework. Please, go through our policies again
        and make sure you understand them. We would hate to see you go!
      </Text>

      <Button fullWidth onClick={acknowledgeWarning}>
        Acknowledge
      </Button>
    </Modal>
  );
};

export default WarningModal;
