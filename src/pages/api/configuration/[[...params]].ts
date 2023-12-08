import IResponseBase from "@/types/api/IResponseBase";
import Authorized from "@/util/api/authorized";
import { getServerConfig } from "@/util/server-config";
import { Get, createHandler } from "@solariusnl/next-api-decorators";

const config = getServerConfig();

/**
 * @todo
 * Create a strongly typed declarative response type
 *
 * @todo
 * Implement features route into the Fw.Features namespace
 */

class ConfigurationRouter {
  @Authorized()
  @Get("/features")
  public async getEnabledFeatures() {
    return <IResponseBase>{
      success: true,
      data: {
        ...config.components["api-keys"],
        ...config.components["bits"],
        ...config.components["dev-profiles"],
        ...config.components["domains"],
        ...config.components["oauth2"],
        ...config.components["redis"],
      },
    };
  }
}

export default createHandler(ConfigurationRouter);
