import { OAuthScope, Prisma } from "@prisma/client";
import IResponseBase from "./IResponseBase";

type IGetMyOAuth2ApplicationsResponse = IResponseBase<{
  apps: Array<IOAuthApplication>;
}>;

type IOAuthApplication = {
  name?: string;
  description?: string;
  createdAt?: Date;
  scopes?: Array<OAuthScope>;
  redirectUri?: string;
  verified?: boolean;
  id?: string;
  _count?: {
    clients?: number;
  }
};

const GetMyOAuth2ApplicationsSelect: Prisma.OAuthApplicationSelect = {
  name: true,
  description: true,
  createdAt: true,
  scopes: true,
  redirectUri: true,
  verified: true,
  id: true,
  _count: {
    select: {
      clients: true,
    },
  },
};

export { GetMyOAuth2ApplicationsSelect };
export type { IGetMyOAuth2ApplicationsResponse, IOAuthApplication };
