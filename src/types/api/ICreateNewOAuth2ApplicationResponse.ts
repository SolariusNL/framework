import { IOAuthApplication } from "@/types/api/IGetMyOAuth2ApplicationsResponse";
import IResponseBase from "@/types/api/IResponseBase";

type ICreateNewOAuth2ApplicationResponse = IResponseBase<{
  app: IOAuthApplication & {
    secret: string;
  };
}>;

export type { ICreateNewOAuth2ApplicationResponse };
