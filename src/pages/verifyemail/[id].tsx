import { Alert, Anchor, Container, Paper } from "@mantine/core";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { HiCheckCircle, HiHome } from "react-icons/hi";
import authorizedRoute from "../../util/authorizedRoute";
import { sendMail } from "../../util/mail";
import prisma from "../../util/prisma";

const VerifyEmail = () => {
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
      >
        <Alert
          title="Email verified"
          color="green"
          icon={<HiCheckCircle size={24} />}
          mb={24}
        >
          Your email has been verified. Thanks.
        </Alert>
        <Link href="/">
          <Anchor
            style={{
              alignItems: "center",
            }}
            weight={500}
          >
            <HiHome style={{ marginRight: 8 }} />
            Return to the homepage
          </Anchor>
        </Link>
      </Paper>
    </Container>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const auth = await authorizedRoute(context, true, false);
  const { id } = context.query;
  const verification = await prisma.emailVerification.findFirst({
    where: {
      id: String(id),
    },
  });

  if (auth.redirect) return auth;
  if (!verification)
    return { redirect: { destination: "/", permanent: false } };
  if (verification.userId != auth.props.user?.id)
    return { redirect: { destination: "/", permanent: false } };
  if (auth.props.user?.emailVerified)
    return { redirect: { destination: "/", permanent: false } };

  await prisma.user.update({
    where: {
      id: auth.props.user?.id,
    },
    data: {
      emailVerified: true,
    },
  });

  await prisma.emailVerification.delete({
    where: {
      id: String(id),
    },
  });

  sendMail(
    String(auth.props.user?.email),
    "Email verified",
    /* html */ `
    <body style="font-family: 'Roboto', sans-serif; background-color: #fafafa; margin: 0;">
      <div id="container" style="max-width: 600px; margin: 0 auto; padding: 30px; background-color: #fff; border: 1px solid #ccc; border-radius: 5px; box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);">
        <h1 style="font-size: 22px; font-weight: 700; color: #333; margin-bottom: 20px;">Welcome to Framework!</h1>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Thank you for joining Framework, the best platform for creativity and imagination. We're excited to have you on board and can't wait to see what you can build.</p>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">If you have any questions or need help getting started, please don't hesitate to contact us at <a href="mailto:support@soodam.rocks" style="color: #00b7ff; text-decoration: none;">support@soodam.rocks</a>.</p>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Best regards,<br>The Framework Team</p>
      </div>
    </body>
    `
  );

  return {
    props: {},
  };
}

export default VerifyEmail;
