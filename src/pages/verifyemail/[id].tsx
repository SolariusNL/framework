import { Alert, Anchor, Container, Paper } from "@mantine/core";
import { render } from "@react-email/render";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { HiCheckCircle, HiHome } from "react-icons/hi";
import VerificationConfirmation from "../../../email/emails/verification-confirmation";
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
    render(<VerificationConfirmation />)
  );

  return {
    props: {},
  };
}

export default VerifyEmail;
