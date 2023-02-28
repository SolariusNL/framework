import {
  Button,
  Container,
  createStyles,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { OAuthApplication, OAuthScope, User } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
import {
  HiCheckCircle,
  HiExternalLink,
  HiKey,
  HiLockClosed,
  HiShieldCheck,
  HiXCircle,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import scopes from "../../data/scopes";
import authorizedRoute from "../../util/auth";
import { exclude } from "../../util/exclude";
import prisma from "../../util/prisma";

type OAuth2FlowProps = {
  user: User;
  app: OAuthApplication;
  providedRedirect: string;
};

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: 26,
    fontWeight: 900,
  },

  controls: {
    [theme.fn.smallerThan("xs")]: {
      flexDirection: "column-reverse",
    },
  },

  control: {
    [theme.fn.smallerThan("xs")]: {
      width: "100%",
      textAlign: "center",
    },
  },
}));

const OAuth2Flow: NextPage<OAuth2FlowProps> = ({
  user,
  app,
  providedRedirect,
}) => {
  const [cookie, setCookie] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCookie(String(getCookie(".frameworksession")));
    }
  }, []);

  return (
    <Container size={420} my={40}>
      <Title align="center">Framework</Title>
      <Text color="dimmed" size="sm" align="center" mt={5}>
        {app.name} is requesting access to the scopes below.
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <Title order={4} mb={6}>
          {app.name}
        </Title>
        <Text color="dimmed" size="sm" mb={18}>
          {app.description}
        </Text>

        <Text size="sm" mb={18}>
          If you trust {app.name}, it:
        </Text>

        <Stack mb="xl">
          {Object.values(OAuthScope).map((scope) => (
            <div className="flex items-center gap-2" key={scope}>
              <div className="flex-shrink-0">
                {app.scopes.includes(scope) ? (
                  <HiCheckCircle
                    className="text-teal-500 items-center flex"
                    size={20}
                  />
                ) : (
                  <HiXCircle
                    className="text-red-500 items-center flex"
                    size={20}
                  />
                )}
              </div>
              <Text size="sm" weight={500}>
                {app.scopes.includes(scope) ? "Can" : "Can't"} {scopes[scope]}
              </Text>
            </div>
          ))}
        </Stack>

        <ReactNoSSR>
          <a
            href={`/api/oauth/authorize?client_id=${app.id}&redirect_uri=${providedRedirect}&auth=${cookie}`}
            className="no-underline"
          >
            <Button fullWidth size="lg" leftIcon={<HiKey />}>
              Allow access for {app.name}
            </Button>
          </a>

          <Stack mt="xl" spacing="sm">
            {[
              {
                icon: <HiExternalLink />,
                text: `
              You will be redirected to ${providedRedirect} to
              complete the authorization process.
            `,
              },
              {
                icon: <HiLockClosed />,
                text: "The developers privacy policy and terms of service apply to this application.",
              },
              {
                icon: <HiShieldCheck />,
                text: "This application cannot read your password or any other sensitive information.",
              },
            ].map((item, i) => (
              <div className="flex items-center gap-4" key={i}>
                <div className="flex-shrink-0">{item.icon}</div>
                <Text
                  size="sm"
                  color="dimmed"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {item.text}
                </Text>
              </div>
            ))}
          </Stack>
        </ReactNoSSR>
      </Paper>
    </Container>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { clientid } = context.query;
  const to = context.query.redirect_uri as string;

  const auth = await authorizedRoute(context, true, false);

  if (auth.redirect) return auth;

  const app = await prisma.oAuthApplication.findFirst({
    where: {
      id: clientid as string,
    },
  });

  if (!app) return context.res.end(JSON.stringify({ error: "invalid_client" }));
  if (app.redirectUri !== to) {
    return context.res.end(
      JSON.stringify({
        error: "invalid_redirect_uri",
        error_description:
          "The redirect URI provided does not match the one registered with the application.",
      })
    );
  }

  return {
    props: {
      user: auth.props.user,
      app: JSON.parse(JSON.stringify(exclude(app, "secret"))),
      providedRedirect: to,
    },
  };
}

export default OAuth2Flow;
