import PinInput from "@/components/pin-input";
import OuterUI from "@/layouts/OuterUI";
import authorizedRoute from "@/util/auth";
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
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { setCookie } from "cookies-next";
import { AnimatePresence, motion } from "framer-motion";
import type { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { HiExclamation, HiXCircle } from "react-icons/hi";

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
  const [unknownHost, setUnknownHost] = useState(false);

  const setLoginCookie = (token: string) => {
    setCookie(".frameworksession", token, {
      maxAge: 60 * 60 * 24 * 30,
      ...(process.env.NEXT_PUBLIC_COOKIE_DOMAIN &&
        !unknownHost &&
        process.env.NEXT_PUBLIC_COOKIE_DOMAIN !== "CHANGE_ME" && {
          domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
        }),
    });
  };

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
          setLoginCookie(res.token);
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
          if (res.ssoRequired) {
            openConfirmModal({
              title: "Single sign-on required",
              children: (
                <div className="flex items-center justify-center">
                  <Text size="sm" color="dimmed">
                    Staff are required to sign in using single sign-on as a
                    security measure. Please click the button below to continue.
                  </Text>
                </div>
              ),
              labels: {
                confirm: "Continue",
                cancel: "Not now",
              },
              onConfirm: () => {
                const url = new URL(res.url);
                url.searchParams.append("redirect_uri", res.redirectUri);
                url.searchParams.append("client_id", res.clientId);
                url.searchParams.append("response_type", "code");
                url.searchParams.append("scope", "openid profile email fw_uid");
                url.searchParams.append("response_type", "code");
                url.searchParams.append("state", res.state);

                window.location.href = url.toString();
              },
            });

            return;
          }
          if (res.requiresEmail) {
            router.push("/verifyemail/login/" + res.emailId);
          } else if (res.otp) {
            setTwofaOpened(true);
            setTwofaUid(res.uid);
          } else {
            setLoginCookie(res.token);
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

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.host !== process.env.NEXT_PUBLIC_HOSTNAME
    ) {
      if (process.env.NEXT_PUBLIC_ENABLE_HOSTNAME_CHECK !== "true") return;
      setUnknownHost(true);
    }
  }, []);

  return (
    <>
      <Modal
        title="Two-factor authentication"
        opened={twofaOpened}
        onClose={() => setTwofaOpened(false)}
        className={useMantineColorScheme().colorScheme}
      >
        <Text mb={16} color="dimmed" size="sm" align="center">
          Please enter the code from your authenticator app below.
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
        <AnimatePresence initial={false}>
          {twofaFailed && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
            >
              <div className="flex mt-4 justify-center items-center">
                <HiXCircle className="text-red-500 mr-2" />
                <Text color="red" size="sm">
                  Invalid code entered
                </Text>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="w-full flex justify-center mt-4">
          <Anchor
            align="center"
            size="sm"
            href="https://wiki.solarius.me/docs/support/totp-issues"
            target="_blank"
          >
            Experiencing issues?
          </Anchor>
        </div>
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
