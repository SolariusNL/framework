import { Alert, Container, Paper } from "@mantine/core";
import { GetServerSidePropsContext } from "next";
import { HiCheckCircle } from "react-icons/hi";
import authorizedRoute from "../../util/authorizedRoute";
import { sendMail } from "../../util/mail";
import prisma from "../../util/prisma";
import { User } from "../../util/prisma-types";

interface VerifyEmailProps {
  user: User;
}

const VerifyEmail = ({ user }: VerifyEmailProps) => {
  return (
    <Container size={460} my={30}>
      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <Alert
          title="Email verified"
          color="green"
          icon={<HiCheckCircle size={24} />}
        >
          Your email has been verified!
        </Alert>
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
    "<p>Your email has been verified! Enjoy Framework, and contact us if you have any questions.</p>"
  );

  return {
    props: {
      user: auth.props.user,
    },
  };
}

export default VerifyEmail;
