import { IOAuthApplication } from "./IGetMyOAuth2ApplicationsResponse";
import IResponseBase from "./IResponseBase";

type ICreateNewOAuth2ApplicationResponse = IResponseBase<{
  app: IOAuthApplication & {
    secret: string;
  };
}>;

export type { ICreateNewOAuth2ApplicationResponse };
