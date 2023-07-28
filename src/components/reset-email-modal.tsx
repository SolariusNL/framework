import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import { Button, Modal, Text, TextInput } from "@mantine/core";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { FC } from "react";
import { HiCheckCircle } from "react-icons/hi";
import Stateful from "./stateful";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ResetEmailModal: FC = () => {
  const { user } = useAuthorizedUserStore();
  const router = useRouter();

  const handleEmailReset = async (email: string) => {
    await fetch("/api/users/@me/changeemail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        newEmail: email,
      }),
    }).finally(() => router.reload());
  };

  return (
    user &&
    <Modal
      title="Reset email"
      opened={user?.emailResetRequired ?? false}
      onClose={() => null}
      withCloseButton={false}
    >
      <Text mb={16}>
        You are required to reset your email address. Please enter a new email
        address below.
      </Text>
      <Stateful>
        {(email, setEmail) => (
          <>
            <TextInput
              type="email"
              label="Email"
              description="Your new email address"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <Button
              mt={14}
              leftIcon={<HiCheckCircle />}
              disabled={
                !email || !EMAIL_REGEX.test(email) || email === user?.email
              }
              onClick={() => handleEmailReset(email)}
            >
              Reset email
            </Button>
          </>
        )}
      </Stateful>
    </Modal>
  );
};

export default ResetEmailModal;
