import { checkSession } from "@/util/auth";
import prisma from "@/util/prisma";
import { nucleusKeySelect } from "@/util/prisma-types";
import { NucleusKey } from "@prisma/client";
import {
  createMiddlewareDecorator,
  createParamDecorator,
} from "@storyofams/next-api-decorators";
import { NextApiRequest, NextApiResponse } from "next";
import { getClientIp } from "request-ip";

const AuthorizedBase = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({
      error: "You are not authorized to access this resource",
    });
  }

  const player = await checkSession(String(token));
  if (!player) {
    return res.status(401).json({
      error: "You are not authorized to access this resource",
    });
  }

  if (player.banned) {
    if (!(new Date(player.banExpires as Date) < new Date())) {
      return res.status(403).json({
        error: "You are banned from Framework",
      });
    }
  }

  const bannedIps = await prisma.bannedIP.findMany({
    where: {
      ip: String(getClientIp(req)),
    },
  });

  if (bannedIps.length > 0) {
    return res.status(403).json({
      error: "You are banned from Framework",
    });
  }

  return player as any;
};

const NucleusAuthorization = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({
      error: "You are not authorized to access this resource",
    });
  }

  const key = await prisma.nucleusKey.findFirst({
    where: {
      key: String(token),
    },
  });

  if (!key) {
    return res.status(401).json({
      error: "You are not authorized to access this resource",
    });
  }

  return key as any;
};

export const Account = createParamDecorator<any>((req: NextApiRequest) => {
  return checkSession(String(req.headers["authorization"]));
});

export const NucleusAuthorized =
  createMiddlewareDecorator(NucleusAuthorization);

export const Nucleus = createParamDecorator<NucleusKey | null>((async (
  req: NextApiRequest
) => {
  return (await prisma.nucleusKey.findFirst({
    where: {
      key: String(req.headers["authorization"]),
    },
    select: nucleusKeySelect,
  })) as NucleusKey | null;
}) as any);

export const Session = createParamDecorator<string>((req: NextApiRequest) => {
  return String(req.headers["authorization"]);
});

const Authorized = createMiddlewareDecorator(AuthorizedBase);

export const AdminAuthorized = createMiddlewareDecorator(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const player = await AuthorizedBase(req, res);
    if (!player) {
      return res.status(401).json({
        error: "You are not authorized to access this resource",
      });
    }

    if (player.role !== "ADMIN") {
      return res.status(401).json({
        error: "You are not authorized to access this resource",
      });
    }
  }
);
export default Authorized;
