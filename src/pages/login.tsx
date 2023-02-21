import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { PinInput } from "@mantine/labs";
import { showNotification } from "@mantine/notifications";
import type { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { HiExclamation, HiXCircle } from "react-icons/hi";
import MinimalFooter from "../components/MinimalFooter";
import authorizedRoute from "../util/auth";
import { setCookie } from "../util/cookies";

interface FormValues {
  username: string;
  password: string;
  rememberMe: boolean;
}

const Login: NextPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    initialValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
    validate: {
      username: (value) =>
        value.length < 3 ||
        (value.length > 29
          ? "Username must be between 3 and 29 characters"
          : undefined),
      password: (value) =>
        value.length < 6 ? "Password must be at least 6 characters" : undefined,
    },
  });
  const [twofaOpened, setTwofaOpened] = useState(false);
  const [twofaCode, setTwofaCode] = useState("");
  const [twofaFailed, setTwofaFailed] = useState(false);
  const [twofaUid, setTwofaUid] = useState("");

  const verifyTwoFactor = async () => {
    await fetch("/api/auth/@me/twofa/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: twofaCode,
        intent: "login",
        uid: twofaUid,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setCookie(".frameworksession", res.token, 365);
          router.push("/").then(() => router.reload());
        } else {
          showNotification({
            title: "Invalid code",
            message: "Please try again.",
            icon: <HiExclamation />,
          });
          setTwofaFailed(true);
          setTimeout(() => setTwofaFailed(false), 5000);
        }
      });
  };

  const handleLogin = async (values: FormValues) => {
    setLoading(true);
    fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: String(values.username),
        password: String(values.password),
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          if (res.requiresEmail) {
            router.push("/verifyemail/login/" + res.emailId);
          } else if (res.otp) {
            setTwofaOpened(true);
            setTwofaUid(res.uid);
          } else {
            setCookie(".frameworksession", res.token, 60);
            router.push("/").then(() => router.reload());
          }
        } else {
          form.setErrors({
            username: "Invalid login",
            password: "Invalid login",
          });
        }
      })
      .catch(() => {
        form.setErrors({
          username: "An unknown error occurred",
          password: "An unknown error occurred",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <Modal
        title="Two-factor authentication"
        opened={twofaOpened}
        onClose={() => setTwofaOpened(false)}
      >
        <Text mb={16}>
          Please enter the code from your authenticator app below. If you are
          having trouble, make sure your clock is set correctly and that you are
          using the correct code for the right account.
        </Text>
        <PinInput
          value={twofaCode}
          onChange={(e) => setTwofaCode(e)}
          length={6}
          className="text-center flex justify-center"
          size="lg"
          type="number"
          styles={{
            input: {
              minHeight: "fit-content",
            },
          }}
        />
        {twofaFailed && (
          <div className="flex mt-2 justify-center items-center">
            <HiXCircle className="text-red-500 mr-2" />
            <Text color="red" size="sm">
              Invalid code entered
            </Text>
          </div>
        )}
        <Button onClick={verifyTwoFactor} fullWidth mt={24}>
          Verify code
        </Button>
      </Modal>
      <Container size={420} my={40}>
        <Title align="center">Framework</Title>
        <Text color="dimmed" size="sm" align="center" mt={5}>
          Framework is in alpha and requires an invite code to join.{" "}
          <Link href="/register">
            <Anchor>Have a code? Register for a Framework account.</Anchor>
          </Link>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md" mb={30}>
          <form onSubmit={form.onSubmit((values) => handleLogin(values))}>
            <Stack spacing={12}>
              <TextInput
                label="Username or email"
                placeholder="Framework"
                required
                {...form.getInputProps("username")}
              />
              <TextInput
                label="Password"
                type="password"
                placeholder="Enter a password"
                required
                {...form.getInputProps("password")}
              />
            </Stack>
            <Group position="apart" mt="md">
              <Checkbox
                label="Remember me"
                {...form.getInputProps("rememberMe")}
              />
              <Link passHref href="/forgotpassword">
                <Anchor size="sm">Forgot your password?</Anchor>
              </Link>
            </Group>
            <Button fullWidth mt="xl" type="submit" loading={loading}>
              Sign in
            </Button>
          </form>
        </Paper>

        <MinimalFooter />
      </Container>
    </>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await authorizedRoute(ctx, false, true);
}

export default Login;
