import { blockedRegions } from "@/data/blocked-regions";
import { exclude } from "@/util/exclude";
import prisma from "@/util/prisma";
import { User, userSelect } from "@/util/prisma-types";
import { OAuthApplication, Session } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { getClientIp } from "request-ip";
import { badgeQueue, queueBadgeSync } from "./badge-sync";
import cast from "./cast";
import { Geolocation, getIPAddressGeolocation } from "./geo";

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

  let account = await getAccountFromSession(token);
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

  const ip = getClientIp(context.req);

  if (account?.recentIp !== ip || !account?.recentIp) {
    getIPAddressGeolocation(ip!).then(async (geo) => {
      if (!geo.error) {
        await prisma.user.update({
          where: {
            id: account?.id,
          },
          data: {
            recentIp: geo.ip,
            recentIpGeo: geo,
          },
        });
      }
    });
  }

  const geoloc = cast<Geolocation>(account?.recentIpGeo);

  if (
    account?.recentIpGeo &&
    blockedRegions[geoloc.country as keyof typeof blockedRegions] !== undefined
  ) {
    return {
      redirect: {
        destination: `/restricted-region/${geoloc.country}`,
        permanent: false,
      },
    };
  }

  if (
    new Date(account?.lastBadgeSync!).getTime() <
    Date.now() - 24 * 60 * 60 * 1000
  ) {
    const existingJob = badgeQueue
      ? await badgeQueue.getJob(`badge:${account?.id.toString()}`)
      : undefined;
    if (!existingJob) await queueBadgeSync(account?.id!);
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
      if (account?.locked && context.resolvedUrl !== "/locked") {
        return {
          redirect: {
            destination: "/locked",
            permanent: false,
            banRedirect: true,
          },
        };
      }

      if (
        account?.lastDailyBits === null ||
        new Date(account?.lastDailyBits!).getTime() <
          Date.now() - 24 * 60 * 60 * 1000
      ) {
        await prisma.user.update({
          where: {
            id: account?.id,
          },
          data: {
            lastDailyBits: new Date(),
            bits: {
              increment: 100,
            },
          },
        });
        account = {
          ...account,
          bits: account?.bits! + 100,
        } as typeof account;
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

async function verifySession(
  token: string
): Promise<(Session & { oauth: OAuthApplication }) | undefined> {
  const session = JSON.parse(
    JSON.stringify(
      await prisma.session.findFirst({
        where: {
          token,
        },
        include: { oauth: true },
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

  if (session.oauth) {
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
          recentIp: true,
          recentIpGeo: true,
          lastBadgeSync: true,
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
