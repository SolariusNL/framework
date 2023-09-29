import cast from "@/util/cast";
import { exclude } from "@/util/exclude";
import { getIPAddressGeolocation } from "@/util/geo";
import prisma from "@/util/prisma";
import { User, userSelect } from "@/util/prisma-types";
import { GetServerSidePropsContext } from "next";
import { getClientIp } from "request-ip";

export const checkSession = async (
  token: string
): Promise<User | undefined> => {
  const session = await prisma.session.findFirst({
    where: { token },
    include: { oauth: true },
  });

  if (!session || !session.userId || session.oauth) {
    return undefined;
  }

  const account = await prisma.user.findFirst({
    where: { id: session.userId },
    select: {
      ...exclude(userSelect, "games"),
      password: true,
      recentIp: true,
    },
  });

  return cast<User>(JSON.parse(JSON.stringify(account)));
};

const updateLastSeenAndBits = async (account: User | undefined) => {
  if (account) {
    await prisma.user.update({
      where: { id: account.id },
      data: { lastSeen: new Date() },
    });

    if (
      !account.lastDailyBits ||
      new Date(account.lastDailyBits).getTime() <
        Date.now() - 24 * 60 * 60 * 1000
    ) {
      await prisma.user.update({
        where: { id: account.id },
        data: {
          lastDailyBits: new Date(),
          bits: {
            increment: 100,
          },
        },
      });
    }
  }
};

const isIpBanned = async (context: GetServerSidePropsContext) => {
  const bannedIps = await prisma.bannedIP.findMany({
    where: { ip: String(getClientIp(context.req)) },
  });

  return bannedIps.length > 0;
};

const redirectTo = (destination: string) => ({
  redirect: {
    destination,
    permanent: false,
  },
});

const authorizedRoute = async (
  context: GetServerSidePropsContext,
  redirectIfNotAuthorized: boolean = true,
  redirectIfAuthorized: boolean = false,
  redirectIfNotAdmin: boolean = false,
  ...props: any[]
): Promise<{
  props?: {
    user?: User;
  };
  redirect?: {
    destination: string;
    permanent: boolean;
  };
}> => {
  const token = context.req.cookies[".frameworksession"];

  if (!token) {
    return redirectIfNotAuthorized
      ? redirectTo("/login")
      : { props: { user: cast<User>(undefined) } };
  }

  const account = await checkSession(token);

  if (await isIpBanned(context)) {
    return redirectTo("/403");
  }

  const ip = getClientIp(context.req);

  if (account?.recentIp !== ip || !account?.recentIp) {
    getIPAddressGeolocation(ip!).then(async (geo) => {
      if (!geo.error) {
        await prisma.user.update({
          where: { id: account?.id },
          data: { recentIp: geo.ip, recentIpGeo: geo },
        });
      }
    });
  }

  if (account) {
    await updateLastSeenAndBits(account);

    if (account.banned && context.resolvedUrl !== "/punished")
      return redirectTo("/punished");
    if (account.locked && context.resolvedUrl !== "/locked")
      return redirectTo("/locked");
    if (redirectIfAuthorized) return redirectTo("/");
    if (redirectIfNotAdmin && account.role !== "ADMIN") return redirectTo("/");

    return {
      props: {
        user: { ...account },
      },
    };
  } else {
    return redirectIfNotAuthorized ? redirectTo("/login") : { props: {} };
  }
};

export default authorizedRoute;
