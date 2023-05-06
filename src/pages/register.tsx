import {
  Anchor,
  Button,
  Checkbox,
  Group,
  MantineColor,
  MantineTheme,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import OuterUI from "../layouts/OuterUI";
import authorizedRoute from "../util/auth";
import { setCookie } from "../util/cookies";

interface FormValues {
  code: string;
  email: string;
  password: string;
  username: string;
  rememberMe: boolean;
}

const Register: NextPage = () => {
  const router = useRouter();
  const form = useForm<FormValues>({
    initialValues: {
      code: "",
      email: "",
      password: "",
      username: "",
      rememberMe: false,
    },
    validate: {
      code: (value) =>
        value.length !== 19
          ? "Code must be 19 digits long (including dashes)"
          : value.split("-").every((part) => part.length === 4)
          ? undefined
          : "Code must be in this format: 0000-0000-0000-0000",
      username: (value) =>
        value.length < 3 || value.length > 29
          ? "Username must be between 3 and 29 characters"
          : value.match(/^[a-zA-Z0-9_]+$/)
          ? undefined
          : "Username must be alphanumeric and underscores only",
      password: (value) =>
        value.length < 6 ? "Password must be at least 6 characters" : undefined,
    },
  });

  const handleRegister = async (values: FormValues) => {
    fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inviteCode: String(values.code),
        email: String(values.email),
        password: String(values.password),
        username: String(values.username),
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setCookie(".frameworksession", res.token, 60);
          router.push("/").then(() => router.reload);
        } else {
          form.setErrors({
            username: res.message || "An unknown error occurred",
            code: res.message || "An unknown error occurred",
            password: res.message || "An unknown error occurred",
            email: res.message || "An unknown error occurred",
          });
        }
      })
      .catch((err) => {
        form.setErrors({
          code: "An unknown error occurred",
          username: "An unknown error occurred",
          password: "An unknown error occurred",
          email: "An unknown error occurred",
        });
      });
  };

  const OAUTH_STYLE = (theme: MantineTheme, color: MantineColor) => ({
    border: `1px solid ${theme.colors[color][9]}`,
  });

  return (
    <>
      <OuterUI
        description={
          <span>
            Framework is in alpha and requires an invite code to join.{" "}
            <Link href="/login">
              <Anchor>Have an account already? Login to your account.</Anchor>
            </Link>
          </span>
        }
      >
        <form onSubmit={form.onSubmit((values) => handleRegister(values))}>
          <Stack spacing={12}>
            <TextInput
              label="Invite code"
              description="You should've received this in your email. If you cannot locate your invite code, please contact us."
              placeholder="0000-0000-0000-0000"
              required
              {...form.getInputProps("code")}
            />

            <TextInput
              label="Username"
              description="Your username is unique to you."
              placeholder="Framework"
              required
              {...form.getInputProps("username")}
            />

            <TextInput
              label="Email"
              type="email"
              description="Used to send you password reset emails, and for general protection."
              placeholder="Enter an email"
              required
              {...form.getInputProps("email")}
            />

            <TextInput
              label="Password"
              type="password"
              description="Your password is used to login to your account."
              placeholder="Enter a password"
              required
              {...form.getInputProps("password")}
            />
          </Stack>
          <Group position="apart" mt="md">
            <Checkbox
              label="Remember me"
              {...form.getInputProps("remainLoggedIn")}
            />
          </Group>
          <Button fullWidth mt="xl" type="submit" mb="sm">
            Register
          </Button>
          {/**
           * @todo Add OAuth signup flow
           */}
          {/* <div className="flex flex-col md:flex-row items-center gap-4">
          <ActionIcon
            variant="light"
            color="blue"
            className="w-full"
            size="xl"
            sx={(theme) => OAUTH_STYLE(theme, "blue")}
          >
            <BsDiscord size={20} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            className="w-full"
            size="xl"
            sx={(theme) => OAUTH_STYLE(theme, "orange")}
            color="orange"
          >
            <BsGoogle size={20} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="indigo"
            className="w-full"
            size="xl"
            sx={(theme) => OAUTH_STYLE(theme, "indigo")}
          >
            <BsTwitter size={20} />
          </ActionIcon>
        </div> */}
        </form>
      </OuterUI>
    </>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await authorizedRoute(ctx, false, true);
}

export default Register;
