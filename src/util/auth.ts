import { Session } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { getClientIp } from "request-ip";
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

  const bannedIps = await prisma.bannedIP.findMany({
    where: {
      ip: String(getClientIp(context.req)),
    },
  });

  if (bannedIps.length > 0) {
    return {
      redirect: {
        destination: "/403",
        permanent: false,
      },
    };
  }

  switch (isAuthorized) {
    case true:
      await prisma.user.update({
        where: {
          id: account?.id,
        },
        data: {
          lastSeen: new Date(),
        },
      });

      if (account?.banned && context.resolvedUrl !== "/punished") {
        return {
          redirect: {
            destination: "/punished",
            permanent: false,
            banRedirect: true,
          },
        };
      }

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

export async function getAccountFromSession(
  token: string
): Promise<User | undefined> {
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
          ...exclude(userSelect, "games"),
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
