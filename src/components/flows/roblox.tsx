import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import { Button, Text, Title } from "@mantine/core";
import { useRouter } from "next/router";
import React from "react";
import { HiCheckCircle } from "react-icons/hi";

/**
  https://apis.roblox.com/oauth/v1/authorize?client_id=1112223334445555
    &redirect_uri=https://www.example.com
    &scope=openid%20profile
    &response_type=code
    &code_challenge=Q12AEaAT69Vl3jhuKSOCK6cFyhHkEQ_haJxUgXJBm4
    &code_challenge_method=S256
  */

const RobloxAuthFlow: React.FC = () => {
  const { user } = useAuthorizedUserStore();
  const clientId = process.env.NEXT_PUBLIC_ROBLOX_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_ROBLOX_REDIRECT_URI;
  const router = useRouter();

  return (
    <>
      <div className="flex text-center items-center flex-col gap-4">
        {user?.robloxTransfer ? (
          <>
            <HiCheckCircle className="text-blue-500 text-6xl" />
            <Title order={3}>Already connected!</Title>
            <Text size="sm" color="dimmed">
              You already have a Roblox account connected to your account.
            </Text>
          </>
        ) : (
          <>
            <Text size="sm" color="dimmed">
              You&apos;ll be redirected to Roblox to connect your account. Rest
              assured, we don&apos;t store any of your Roblox data. It is only
              read once and then discarded.
            </Text>
            {clientId && redirectUri ? (
              <Button
                mt="sm"
                fullWidth
                onClick={() =>
                  router.push(
                    `https://apis.roblox.com/oauth/v1/authorize?client_id=${clientId}&redirect_uri=${encodeURI(
                      redirectUri
                    )}&scope=openid%20profile&response_type=code`
                  )
                }
                size="lg"
              >
                Connect Roblox
              </Button>
            ) : (
              <Text mt="xl" color="red">
                Roblox client ID is missing.
              </Text>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default RobloxAuthFlow;
