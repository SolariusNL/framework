import {
  Alert,
  Avatar,
  Button,
  Container,
  Paper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DiscordConnectCode } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import { useState } from "react";
import Framework from "../../components/Framework";
import authorizedRoute from "../../util/auth";
import getMediaUrl from "../../util/get-media";
import { User } from "../../util/prisma-types";

interface DiscordServiceProps {
  user: User;
}

const DiscordService: NextPage<DiscordServiceProps> = ({ user }) => {
  const [enteredCode, setEnteredCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fetchedInfo, setFetchedInfo] = useState<DiscordConnectCode>();

  const connectDiscord = async () => {
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
      });
  };

  return (
    <Framework
      user={user}
      activeTab="none"
      modernTitle="Connect Discord"
      modernSubtitle="Enter the code you've received from the bot to connect your Discord account."
    >
      <Container size={460} my={30}>
        <Paper
          withBorder
          shadow="md"
          p={30}
          radius="md"
          mt="xl"
          sx={(theme) => ({
            background:
              theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
          })}
        >
          {success ? (
            <div className="items-center flex flex-col">
              <Avatar
                src={getMediaUrl(fetchedInfo!.imageUrl)}
                size="xl"
                radius={999}
                mb={24}
              />
              <Title order={5}>
                Hello, {fetchedInfo?.username}
                <span className="text-gray-500">
                  #{fetchedInfo?.discriminator}
                </span>
                !
              </Title>
            </div>
          ) : (
            <>
              <Text mb={12}>
                Enter the code.{" "}
                <span className="text-gray-500 font-semibold">
                  (Example: 196-441-591)
                </span>
              </Text>

              <TextInput
                required
                label="Code"
                description="Enter the code."
                placeholder="000-000-000"
                mb={16}
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.currentTarget.value)}
              />

              <Button
                fullWidth
                disabled={
                  enteredCode.length !== 11 ||
                  enteredCode.split("-").length !== 3 ||
                  enteredCode.split("-").some((x) => x.length !== 3)
                }
                onClick={connectDiscord}
              >
                Connect
              </Button>

              {error && (
                <Alert mt={12} title="Error" color="red">
                  {error}
                </Alert>
              )}
            </>
          )}
        </Paper>
      </Container>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default DiscordService;
