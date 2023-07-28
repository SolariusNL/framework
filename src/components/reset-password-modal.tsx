import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import { Button, Modal, PasswordInput, Text } from "@mantine/core";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { FC } from "react";
import { HiCheckCircle } from "react-icons/hi";
import Stateful from "./stateful";

const ResetPasswordModal: FC = () => {
  const { user } = useAuthorizedUserStore();
  const router = useRouter();

  const handlePasswordReset = async (password: string) => {
    await fetch("/api/users/@me/changepassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        newPassword: password,
      }),
    }).finally(() => router.reload());
  };

  return (
    user &&
    <Modal
      title="Reset password"
      opened={user?.passwordResetRequired ?? false}
      onClose={() => null}
      withCloseButton={false}
    >
      <Text mb={16}>
        You are required to reset your password. Please enter a new password
        below.
      </Text>
      <Stateful>
        {(password, setPassword) => (
          <>
            <PasswordInput
              label="Password"
              description="Your new password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
            />
            <Button
              mt={14}
              leftIcon={<HiCheckCircle />}
              disabled={!password || password.length < 8}
              onClick={() => handlePasswordReset(password)}
            >
              Reset password
            </Button>
          </>
        )}
      </Stateful>
    </Modal>
  );
};

export default ResetPasswordModal;
