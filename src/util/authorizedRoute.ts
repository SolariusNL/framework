import { Session } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { exclude } from "./exclude";
import prisma from "./prisma";
import { User, userSelect } from "./prisma-types";

const authorizedRoute = async (
  context: GetServerSidePropsContext,
  redirectIfNotAuthorized: boolean = true,
  redirectIfAuthorized: boolean = false,
  redirectIfNotAdmin: boolean = false,
  ...props: any[]
) => {
  const token = context.req.cookies[".frameworksession"];

  if (token === undefined) {
    if (redirectIfNotAuthorized) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    } else {
      return {
        props: { ...props },
      };
    }
  }

  const account = await getAccountFromSession(token);
  const isAuthorized = !!account;

  switch (isAuthorized) {
    case true:
      if (redirectIfAuthorized) {
        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      } else {
        if (redirectIfNotAdmin && account!.role !== "ADMIN") {
          return {
            redirect: {
              destination: "/",
              permanent: false,
            },
          };
        }

        return {
          props: {
            user: {
              ...account,
            },
          },
        };
      }
    case false:
      if (redirectIfNotAuthorized) {
        return {
          redirect: {
            destination: "/login",
            permanent: false,
          },
        };
      } else {
        return { props: {} };
      }
  }
};

async function verifySession(token: string): Promise<Session | undefined> {
  const session = JSON.parse(
    JSON.stringify(
      await prisma.session.findFirst({
        where: {
          token,
        },
      })
    )
  );

  if (!session) {
    return undefined;
  }

  return session;
}

export async function getAccountFromSession(token: string): Promise<User | undefined> {
  const session = await verifySession(token);

  if (!session || !session.userId) {
    return undefined;
  }

  const account = JSON.parse(
    JSON.stringify(
      await prisma.user.findFirst({
        where: {
          id: session.userId,
        },
        select: {
          ...userSelect,
          password: true,
        },
      })
    )
  );

  if (!account) {
    return undefined;
  }

  return account;
}

export default authorizedRoute;
