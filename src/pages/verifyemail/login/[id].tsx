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
import { EmailLoginRequest } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from "next";
import Stateful from "../../../components/Stateful";
import prisma from "../../../util/prisma";
import { nonCurrentUserSelect, NonUser } from "../../../util/prisma-types";
import { motion } from "framer-motion";
import { HiCheckCircle } from "react-icons/hi";
import { useState } from "react";
import { setCookie } from "cookies-next";
import { useRouter } from "next/router";
import getMediaUrl from "../../../util/getMedia";

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
      <Paper
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
              />
              {error && (
                <Alert title="Failed to verify" className="mb-4 mt-4">
                  {error || "An unknown error occurred"}
                </Alert>
              )}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: code && code.length === 6 ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4"
              >
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
                        if (res.success) {
                          setCookie(".frameworksession", res.token, {
                            maxAge: 60 * 60 * 24 * 7,
                          });
                          router.push("/");
                        } else {
                          setError(res.error);
                        }
                      })
                      .catch(() => {
                        setError("An unknown error occurred");
                      })
                      .finally(() => {
                        setLoading(false);
                      });
                  }}
                >
                  Verify
                </Button>
              </motion.div>
            </>
          )}
        </Stateful>
      </Paper>
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
