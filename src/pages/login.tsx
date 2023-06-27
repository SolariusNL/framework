import {
  Anchor,
  Button,
  Checkbox,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import type { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { HiExclamation, HiXCircle } from "react-icons/hi";
import PinInput from "@/components/PinInput";
import OuterUI from "@/layouts/OuterUI";
import authorizedRoute from "@/util/auth";
import { setCookie } from "@/util/cookies";

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
  const [twofaFailed, setTwofaFailed] = useState(false);
  const [twofaUid, setTwofaUid] = useState("");
  const [lockError, setLockError] = useState("");

  const verifyTwoFactor = async (code: string) => {
    await fetch("/api/auth/@me/twofa/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: code,
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
          if (res.status === 403) {
            setLockError(res.message);
          }
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
        className={useMantineColorScheme().colorScheme}
      >
        <Text mb={16} color="dimmed" size="sm" align="center">
          Please enter the code from your authenticator app below. If you are
          having trouble, make sure your clock is set correctly and that you are
          using the correct code for the right account.
        </Text>
        <PinInput
          onChange={(e) => {
            verifyTwoFactor(String(e));
          }}
          length={6}
          className="text-center flex justify-center"
          type="number"
          autoFocus
        />
        {twofaFailed && (
          <div className="flex mt-2 justify-center items-center">
            <HiXCircle className="text-red-500 mr-2" />
            <Text color="red" size="sm">
              Invalid code entered
            </Text>
          </div>
        )}
      </Modal>
      <OuterUI
        description={
          <span>
            Framework is in alpha and requires an invite code to join.{" "}
            <Link href="/register">
              <Anchor>Have a code? Register for a Framework account.</Anchor>
            </Link>
          </span>
        }
      >
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
          {lockError && (
            <div className="flex mt-5 items-center gap-2">
              <HiXCircle className="text-red-500 flex-shrink-0" />
              <Text color="red" size="sm">
                {lockError}
              </Text>
            </div>
          )}
          <Button fullWidth mt="xl" type="submit" loading={loading}>
            Sign in
          </Button>
        </form>
      </OuterUI>
    </>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await authorizedRoute(ctx, false, true);
}

export default Login;
