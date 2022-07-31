import type { GetServerSidePropsContext, NextPage } from "next";
import {
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
} from "@mantine/core";
import Link from "next/link";
import authorizedRoute from "../util/authorizedRoute";
import { useForm } from "@mantine/form";
import { setCookie } from "../util/cookies";
import { useRouter } from "next/router";

interface FormValues {
  code: string;
  remainLoggedIn: boolean;
}

const Invite: NextPage = () => {
  const router = useRouter();
  const form = useForm<FormValues>({
    initialValues: {
      code: "",
      remainLoggedIn: false,
    },
    validate: {
      code: (value) =>
        value.length !== 19
          ? "Code must be 19 digits long (including dashes)"
          : value.split("-").every((part) => part.length === 4)
          ? undefined
          : "Code must be in this format: 0000-0000-0000-0000",
    },
  });

  const handleInviteSubmit = async (values: FormValues) => {
    fetch("/api/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inviteCode: String(values.code),
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setCookie(".frameworksession", form.values.code, 365);
          router.push("/");
        } else {
          form.setErrors({
            code: "Invalid code",
          });
        }
      })
      .catch((err) => {
        form.setErrors({
          code: "An unknown error occurred",
        });
      });
  };

  return (
    <Container size={420} my={40}>
      <Title align="center">Framework</Title>
      <Text color="dimmed" size="sm" align="center" mt={5}>
        Framework is in alpha and requires an invite code to join.
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md" mb={30}>
        <form onSubmit={form.onSubmit((values) => handleInviteSubmit(values))}>
          <TextInput
            label="Invite code"
            description="You should've received this in your email. If you cannot locate your invite code, please contact us."
            placeholder="0000-0000-0000-0000"
            required
            {...form.getInputProps("code")}
          />
          <Group position="apart" mt="md">
            <Checkbox
              label="Remember me"
              {...form.getInputProps("remainLoggedIn")}
            />
            <Anchor<"a">
              onClick={(event) => event.preventDefault()}
              href="#"
              size="sm"
            >
              Recover invite code
            </Anchor>
          </Group>
          <Button fullWidth mt="xl" type="submit">
            Sign in
          </Button>
        </form>
      </Paper>

      <Text size="sm" align="center" mb={5} weight={500} color="dimmed">
        Copyright © 2022 Soodam.re. All rights reserved.
      </Text>

      <Group
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
        spacing={14}
      >
        <Link href="/privacy">
          <Anchor size="sm">Privacy</Anchor>
        </Link>

        <Link href="/tos">
          <Anchor size="sm">Terms of Service</Anchor>
        </Link>

        <Link href="/guidelines">
          <Anchor size="sm">Guidelines</Anchor>
        </Link>
      </Group>
    </Container>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return await authorizedRoute(ctx, false, true);
}

export default Invite;
