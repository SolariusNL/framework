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
}

export default createHandler(DocRouter);
