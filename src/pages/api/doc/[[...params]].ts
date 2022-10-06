import { createHandler, Get } from "@storyofams/next-api-decorators";
import { readFile } from "fs/promises";
import { RateLimitMiddleware } from "../../../util/rateLimit";

class DocRouter {
  @Get("/license")
  @RateLimitMiddleware(20)()
  async getLicense() {
    const license = await readFile("./LICENSE", "utf-8");
    return license;
  }

  @Get("/version")
  @RateLimitMiddleware(20)()
  async getVersion() {
    const data = await readFile("./package.json", "utf-8");
    const { version } = JSON.parse(data);
    return version;
  }
}

export default createHandler(DocRouter);
