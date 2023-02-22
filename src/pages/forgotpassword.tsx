import {
  Anchor,
  Box,
  Button,
  Center,
  Container,
  createStyles,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { PasswordResetRequest } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { HiArrowLeft, HiCheckCircle, HiXCircle } from "react-icons/hi";
import authorizedRoute from "../util/auth";
import prisma from "../util/prisma";
import { nonCurrentUserSelect, NonUser } from "../util/prisma-types";

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

const ForgotPassword: React.FC<{
  hasToken: boolean;
  token: PasswordResetRequest & {
    user: NonUser;
  };
}> = ({ hasToken, token }) => {
  const { classes } = useStyles();
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  const form = useForm<{
    email: string;
  }>({
    initialValues: {
      email: "",
    },
    validate: {
      email: (value) =>
        !emailRegex.test(value)
          ? "Please enter a valid email address"
          : undefined,
    },
  });
  const router = useRouter();

  const newPasswordForm = useForm<{
    password: string;
    confirmPassword: string;
  }>({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: {
      password: (value) =>
        value.length < 3 ? "Password must be at least 3 characters" : undefined,
      confirmPassword: (value, values) =>
        value !== values.password ? "Passwords do not match" : undefined,
    },
  });

  return (
    <Container size={420} my={40}>
      <Title align="center">Framework</Title>
      <Text color="dimmed" size="sm" align="center" mt={5}>
        Enter your email address and we will send you a link to reset your
        password.
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        {hasToken ? (
          <form
            onSubmit={newPasswordForm.onSubmit(async (values) => {
              await fetch("/api/auth/forgotpassword/auth", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  password: values.password,
                  token: token.id,
                }),
              })
                .then((res) => res.json())
                .then((res) => {
                  if (res.success) {
                    showNotification({
                      title: "Password reset",
                      message:
                        "Your password has been reset. You will be redirected to the login page.",
                      icon: <HiCheckCircle />,
                    });
                    router.push("/login");
                  } else {
                    showNotification({
                      title: "Error",
                      message:
                        "We were unable to reset your password because of certain circumstances. Please try again later.",
                      icon: <HiXCircle />,
                    });
                  }
                });
            })}
          >
            <PasswordInput
              label="New password"
              placeholder="********"
              required
              mb="sm"
              {...newPasswordForm.getInputProps("password")}
            />
            <PasswordInput
              label="Confirm password"
              placeholder="********"
              required
              {...newPasswordForm.getInputProps("confirmPassword")}
            />
            <Group position="apart" mt="lg" className="items-end justify-end">
              <Button className={classes.control} type="submit">
                Reset password
              </Button>
            </Group>
          </form>
        ) : (
          <form
            onSubmit={form.onSubmit(async (values) => {
              await fetch("/api/auth/forgotpassword", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
              }).finally(() => {
                form.reset();
                showNotification({
                  title: "Reset link sent",
                  message:
                    "If the email address you entered is valid, you should receive an email with a reset link shortly.",
                  icon: <HiCheckCircle />,
                });
              });
            })}
          >
            <TextInput
              label="Your email"
              placeholder="me@soodam.rocks"
              required
              {...form.getInputProps("email")}
            />
            <Group position="apart" mt="lg" className={classes.controls}>
              <Link href="/login" passHref>
                <Anchor color="dimmed" size="sm" className={classes.control}>
                  <Center inline>
                    <HiArrowLeft size={12} />
                    <Box ml={5}>Back to login page</Box>
                  </Center>
                </Anchor>
              </Link>
              <Button className={classes.control} type="submit">
                Reset password
              </Button>
            </Group>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const auth = await authorizedRoute(ctx, false, true);
  if (auth.redirect) return auth;

  const token = ctx.query.token;
  if (token) {
    const request = await prisma.passwordResetRequest.findFirst({
      where: {
        id: token as string,
      },
      include: {
        user: nonCurrentUserSelect,
      },
    });

    if (!request) {
      return { props: {} };
    }

    if (
      new Date().getTime() - new Date(request.createdAt).getTime() >
      1800000
    ) {
      await prisma.passwordResetRequest.delete({
        where: {
          id: request.id,
        },
      });

      return { props: {} };
    }

    return {
      props: {
        hasToken: true,
        token: JSON.parse(JSON.stringify(request)),
      },
    };
  } else {
    return {
      props: {},
    };
  }
}

export default ForgotPassword;
