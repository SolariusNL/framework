import {
  Alert,
  Button,
  Grid,
  Group,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import React from "react";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import Framework from "../../../../components/Framework";
import authorizedRoute from "../../../../util/authorizedRoute";
import { getCookie } from "../../../../util/cookies";
import prisma from "../../../../util/prisma";
import { Game, gameSelect, User } from "../../../../util/prisma-types";
import useMediaQuery from "../../../../util/useMediaQuery";

interface AddGameConnectionProps {
  user: User;
  game: Game;
}

interface AddGameConnectionForm {
  ip: string;
  port: number;
}

const AddGameConnection = ({ user, game }: AddGameConnectionProps) => {
  const mobile = useMediaQuery("768");
  const form = useForm<AddGameConnectionForm>({
    initialValues: {
      ip: "",
      port: 5572,
    },
    validate: {
      ip: (value) =>
        !value.match(
          /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        )
          ? "Must be a valid IP address"
          : null,
      port: (value) =>
        value < 1 || value > 65535 ? "Must be a valid port" : null,
    },
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [serverChecked, setServerChecked] = React.useState(false);
  const [checkedServerIpPortPair, setCheckedServerIpPortPair] =
    React.useState<any>({});
  const router = useRouter();
  const theme = useMantineTheme();

  const checkServer = async () => {
    setLoading(true);
    setError(null);

    await fetch(`http://${form.values.ip}:${form.values.port}/api/server`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.sync == false) {
          setError(
            "Your server is configured to not sync with Soodam.re networking. You must enable this in your server's config file."
          );
        } else {
          setServerChecked(true);
          setCheckedServerIpPortPair({
            ip: form.values.ip,
            port: form.values.port,
          });
        }
      })
      .catch((err) => {
        setError("Could not connect to server. Check your IP and port.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onSubmit = async (values: AddGameConnectionForm) => {
    if (form.validate().hasErrors) {
      return;
    }

    setLoading(true);
    setError(null);

    if (!serverChecked) {
      setLoading(false);
      return setError("Please verifys the server before adding a connection.");
    }

    if (
      checkedServerIpPortPair.ip != values.ip ||
      checkedServerIpPortPair.port != values.port
    ) {
      setLoading(false);
      setServerChecked(false);
      return setError("Please verify the server before adding a connection.");
    }

    await fetch(`/games/${game.id}/connection/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        ip: values.ip,
        port: values.port,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          router.push(`/game/${game.id}`);
        } else {
          setError(res.error || "An unknown error occurred");
        }
      })
      .catch((err) => {
        setError(err.message || "An unknown error occurred");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Framework activeTab="invent" user={user}>
      <Title mb={24}>Add Connection</Title>

      <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
        <Grid columns={3}>
          <Grid.Col span={mobile ? 3 : 1}>
            <TextInput
              label="IP Address"
              description="The IP address of the server. Make sure this is the public IP of the server, and not the local IP."
              placeholder="127.0.0.1"
              {...form.getInputProps("ip")}
            />
          </Grid.Col>

          <Grid.Col span={mobile ? 3 : 1}>
            <TextInput
              label="Port"
              description="The port of the server. Make sure you've configured your firewall to allow connections on this port."
              placeholder="25565"
              {...form.getInputProps("port")}
            />
          </Grid.Col>

          <Grid.Col span={mobile ? 3 : 1}>
            {error && (
              <Alert
                mb={10}
                icon={<HiXCircle size="28" />}
                title="Failed to add connection"
                color="red"
              >
                {error}
              </Alert>
            )}
            <Group position="apart" mb={10}>
              <Group spacing={6}>
                {serverChecked ? (
                  <>
                    <HiCheckCircle color={theme.colors.green[6]} size="16" />
                    <Text weight={500} color={theme.colors.green[6]} size="sm">
                      Server verified
                    </Text>
                  </>
                ) : (
                  <>
                    <HiXCircle color={theme.colors.red[6]} size="16" />
                    <Text weight={500} color={theme.colors.red[6]} size="sm">
                      Server not verified
                    </Text>
                  </>
                )}
              </Group>

              <Button size="xs" variant="subtle" onClick={checkServer}>
                Verify Server
              </Button>
            </Group>
            <Button type="submit" fullWidth loading={loading}>
              Add Server
            </Button>
          </Grid.Col>
        </Grid>
      </form>
    </Framework>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const auth = await authorizedRoute(ctx);
  if (auth.redirect) {
    return auth;
  }

  const { id } = ctx.query;
  const game = await prisma.game.findFirst({
    where: { id: Number(id) },
    select: gameSelect,
  });

  return {
    props: {
      game: JSON.parse(JSON.stringify(game)),
      user: auth?.props?.user,
    },
  };
}

export default AddGameConnection;
