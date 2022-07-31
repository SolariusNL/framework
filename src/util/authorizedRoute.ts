import { GetServerSidePropsContext } from "next";
import { exclude } from "./exclude";
import prisma from "./prisma";

const authorizedRoute = async (
  context: GetServerSidePropsContext,
  redirectIfNotAuthorized: boolean = true,
  redirectIfAuthorized: boolean = false,
  ...props: any[]
) => {
  const loginCode = context.req.cookies[".frameworksession"];

  if (!loginCode && redirectIfNotAuthorized) {
    return {
      redirect: {
        destination: "/invite",
        permanent: false,
      },
    };
  }

  const match = await prisma.user.findFirst({
    where: {
      inviteCode: loginCode,
    },
  });

  if (!match && redirectIfNotAuthorized) {
    return {
      redirect: {
        destination: "/invite",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: exclude(JSON.parse(JSON.stringify(match)), "inviteCode"),
      ...props,
    },
  };
};

export default authorizedRoute;
