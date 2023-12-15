import IResponseBase from "@/types/api/IResponseBase";
import select from "@/util/select";
import { getServerConfig } from "@/util/server-config";
import { Get, createHandler } from "@solariusnl/next-api-decorators";

const config = getServerConfig();

class ConfigurationRouter {
  @Get("/features")
  public async getEnabledFeatures() {
    return <IResponseBase>{
      success: true,
      data: {
        "api-keys": config.components["api-keys"],
        bits: config.components["bits"],
        "dev-profiles": config.components["dev-profiles"],
        domains: config.components["domains"],
        oauth2: config.components["oauth2"],
        redis: config.components["redis"],
        "abuse-reports": select(config.components["abuse-reports"], "enabled"),
      },
    };
  }
}

export default createHandler(ConfigurationRouter);
