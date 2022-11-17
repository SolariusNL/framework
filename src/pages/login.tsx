import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import MinimalFooter from "../components/MinimalFooter";
import authorizedRoute from "../util/authorizedRoute";
import { setCookie } from "../util/cookies";

interface FormValues {
  username: string;
  password: string;
  rememberMe: boolean;
}

const Login: NextPage = () => {
  const router = useRouter();
  const form = useForm<FormValues>({
    initialValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
    validate: {
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

  const handleLogin = async (values: FormValues) => {
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
          } else {
            setCookie(".frameworksession", res.token, 60);
            router.push("/");
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
      });
  };

  return (
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
              label="Username"
              placeholder="Framework"
              required
              {...form.getInputProps("username")}
            />
            <TextInput
              label="Password"
              type="password"
              placeholder="balllicker935"
              required
              {...form.getInputProps("password")}
            />
          </Stack>
          <Group position="apart" mt="md">
            <Checkbox
              label="Remember me"
              {...form.getInputProps("rememberMe")}
            />
          </Group>
          <Button fullWidth mt="xl" type="submit">
            Sign in
          </Button>
        </form>
      </Paper>

      <MinimalFooter />
    </Container>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await authorizedRoute(ctx, false, true);
}

export default Login;
