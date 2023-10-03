import OuterUI from "@/layouts/OuterUI";
import authorizedRoute from "@/util/auth";
import { sendMail } from "@/util/mail";
import prisma from "@/util/prisma";
import { Alert, Anchor, Box, Center } from "@mantine/core";
import { render } from "@react-email/render";
import VerificationConfirmation from "email/emails/verification-confirmation";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { HiArrowLeft, HiCheckCircle } from "react-icons/hi";

const VerifyEmail = () => {
  return (
    <OuterUI description="Thanks for verifying your email.">
      <Alert
        title="Email verified"
        color="green"
        icon={<HiCheckCircle size={24} />}
        mb={24}
      >
        Your email has been verified. Thanks.
      </Alert>
      <Link href="/">
        <Anchor color="dimmed" size="sm">
          <Center inline>
            <HiArrowLeft size={12} />
            <Box ml={5}>Go to homepage</Box>
          </Center>
        </Anchor>
      </Link>
    </OuterUI>
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

  sendMail({
    to: String(auth.props.user?.email),
    subject: "Email verified",
    html: render(<VerificationConfirmation />),
  });

  return {
    props: {},
  };
}

export default VerifyEmail;
