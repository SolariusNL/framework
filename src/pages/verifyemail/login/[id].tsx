import {
  Alert,
  Avatar,
  Button,
  Container,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { EmailLoginRequest } from "@prisma/client";
import { setCookie } from "cookies-next";
import { motion } from "framer-motion";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import ShadedCard from "../../../components/ShadedCard";
import Stateful from "../../../components/Stateful";
import getMediaUrl from "../../../util/getMedia";
import prisma from "../../../util/prisma";
import { nonCurrentUserSelect, NonUser } from "../../../util/prisma-types";

interface EmailLoginProps {
  emailId: string;
  request: Omit<
    EmailLoginRequest & {
      user: NonUser;
    },
    "code"
  >;
}

const EmailLogin: NextPage<EmailLoginProps> = ({ emailId, request }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <Container size={460} my={30}>
      <ShadedCard
        withBorder
        shadow="md"
        p={30}
        radius="md"
        mt="xl"
        sx={(theme) => ({
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        })}
        className="flex flex-col items-center"
      >
        <Avatar
          src={getMediaUrl(request.user.avatarUri)}
          size="lg"
          className="mb-4 rounded-full"
        />
        <Title order={4} mb={6}>
          Hey, {request.user.username}.
        </Title>
        <Text color="dimmed" align="center" mb={32}>
          Please check your email for a 6-digit code, then enter it below.
        </Text>
        <Stateful>
          {(code: string, setCode: (code: string) => void) => (
            <>
              <TextInput
                label="Code"
                description="6-digit code"
                required
                value={code}
                onChange={(e) => setCode(String(e.currentTarget.value))}
                error={
                  code && code.toString().length !== 6
                    ? "Code must be 6 digits"
                    : undefined
                }
                type="text"
                placeholder="123456"
                width="100%"
                maxLength={6}
                className="w-full mb-4"
              />
              {error && (
                <Alert
                  title="Failed to verify"
                  color="red"
                  className="w-full mb-4"
                  icon={<HiXCircle />}
                >
                  {error || "An unknown error occurred"}
                </Alert>
              )}
              <Button
                fullWidth
                leftIcon={<HiCheckCircle />}
                loading={loading}
                onClick={async () => {
                  setLoading(true);

                  await fetch(`/api/auth/email/${emailId}/${code}`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  })
                    .then((res) => res.json())
                    .then((res) => {
                      if (res.success === true) {
                        setCookie(".frameworksession", res.token, {
                          maxAge: 60 * 60 * 24 * 7,
                        });
                        router.push("/");
                      } else {
                        setError(res.message || "An unknown error occurred");
                      }
                    })
                    .catch(() => {
                      setError("An unknown error occurred");
                    })
                    .finally(() => {
                      setLoading(false);
                    });
                }}
                disabled={
                  code && code.toString().length !== 6 ? true : loading
                }
              >
                Verify
              </Button>
            </>
          )}
        </Stateful>
      </ShadedCard>
    </Container>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.query;
  const request = await prisma.emailLoginRequest.findFirst({
    where: {
      id: String(id),
    },
    select: {
      id: true,
      user: nonCurrentUserSelect,
      createdAt: true,
    },
  });

  if (
    !request ||
    new Date(JSON.parse(JSON.stringify(request)).createdAt).getTime() +
      1000 * 60 * 60 <
      Date.now()
  ) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      emailId: String(id),
      request: JSON.parse(JSON.stringify(request)),
    },
  };
}

export default EmailLogin;
