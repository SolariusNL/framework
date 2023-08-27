import InlineError from "@/components/inline-error";
import OuterUI from "@/layouts/OuterUI";
import authorizedRoute from "@/util/auth";
import { Fw } from "@/util/fw";
import { User } from "@/util/prisma-types";
import { Avatar, Button, Text, TextInput, Title } from "@mantine/core";
import { DiscordConnectCode } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { BLACK } from "../teams/t/[slug]/issue/create";

interface DiscordServiceProps {
  user: User;
}

const DiscordService: NextPage<DiscordServiceProps> = ({ user }) => {
  const [enteredCode, setEnteredCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fetchedInfo, setFetchedInfo] = useState<DiscordConnectCode>();
  const router = useRouter();

  const connectDiscord = async () => {
    setLoading(true);
    await fetch("/api/oauth/services/discord/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        code: enteredCode,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.error) {
          setError(res.error);
        } else {
          setSuccess(true);
          setFetchedInfo(res);
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <OuterUI
      title="Link with Discord"
      description="Link your Discord account to your Framework account."
    >
      {success && fetchedInfo !== undefined ? (
        <div className="items-center flex flex-col">
          <Avatar
            src={fetchedInfo!.imageUrl}
            size="xl"
            radius={999}
            mb={24}
            color={Fw.Strings.color(fetchedInfo?.username!)}
          >
            {Fw.Strings.initials(fetchedInfo?.username!)}
          </Avatar>
          <Title order={2}>Hello, @{fetchedInfo.username}</Title>
          <Text size="sm" color="dimmed" mt="md" align="center">
            Your Discord account has been linked to your Framework account.
          </Text>
          <Button
            mt="xl"
            radius="xl"
            variant="light"
            onClick={() => router.push("/")}
          >
            Go Home
          </Button>
        </div>
      ) : (
        <>
          <Text size="sm" color="dimmed">
            Enter the code you received from the Discord bot.
          </Text>
          <TextInput
            required
            label="Code"
            placeholder="123-456-789"
            my="lg"
            value={enteredCode}
            onChange={(e) => {
              const inputValue = e.currentTarget.value.replace(/-/g, "");
              let formattedValue = "";

              for (let i = 0; i < inputValue.length; i += 3) {
                formattedValue += inputValue.slice(i, i + 3) + "-";
              }

              formattedValue = formattedValue.slice(0, -1);

              setEnteredCode(formattedValue);
            }}
            classNames={BLACK}
            maxLength={11}
          />
          <div className="flex justify-end">
            <Button
              disabled={
                enteredCode.length !== 11 ||
                enteredCode.split("-").length !== 3 ||
                enteredCode.split("-").some((x) => x.length !== 3)
              }
              onClick={connectDiscord}
              variant="light"
              radius="xl"
              loading={loading}
            >
              Connect
            </Button>
          </div>
          {error && (
            <InlineError
              title="An error occurred."
              variant="error"
              className="mt-6"
            >
              {error}
            </InlineError>
          )}
        </>
      )}
    </OuterUI>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default DiscordService;
