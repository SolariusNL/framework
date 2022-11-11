import { Button, Card, Container, Stack, Text, Title } from "@mantine/core";
import { OAuth2Client, User } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
import { HiCheckCircle } from "react-icons/hi";
import authorizedRoute from "../../util/authorizedRoute";
import prisma from "../../util/prisma";
import ReactNoSSR from "react-no-ssr";

interface OAuth2FlowProps {
  user: User;
  app: OAuth2Client;
  providedRedirect: string;
}

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
    <Container size={460} my={30}>
      <Card
        shadow="md"
        p={30}
        withBorder
        className="text-center center content-center"
      >
        <Title order={4} mb={6}>
          {app.name}
        </Title>
        <Text color="dimmed" size="sm" mb={18}>
          {app.description}
        </Text>

        <Text size="sm" mb={18}>
          is requesting access for these scopes:
        </Text>

        <Stack mb={32}>
          {app.grants.map((scope) => (
            <div className="flex" key={scope}>
              <HiCheckCircle className="text-teal-500 mr-4" />
              <Text size="sm" weight={500}>
                {scope}
              </Text>
            </div>
          ))}
        </Stack>

        <ReactNoSSR>
          <a
            href={`/api/oauth/authorize?client_id=${app.secret}&redirect_uri=${providedRedirect}&auth=${cookie}`}
            className="no-underline"
          >
            <Button fullWidth>Allow access for {app.name}</Button>
          </a>

          <Text color="dimmed" size="sm" mt={6}>
            You will be redirected to {providedRedirect}
          </Text>
        </ReactNoSSR>
      </Card>
    </Container>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { secret } = context.query;
  const to = context.query.to as string;

  const auth = await authorizedRoute(context, true, false);

  if (auth.redirect) return auth;

  const app = await prisma.oAuth2Client.findFirst({
    where: {
      secret: String(secret),
    },
  });

  if (!app) return { redirect: { destination: "/", permanent: false } };
  if (!app.redirectUri.includes(to))
    return { redirect: { destination: "/", permanent: false } };

  return {
    props: {
      user: auth.props.user,
      app: JSON.parse(JSON.stringify(app)),
      providedRedirect: to,
    },
  };
}

export default OAuth2Flow;
