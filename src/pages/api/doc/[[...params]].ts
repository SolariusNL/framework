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

  @Get("/status")
  @RateLimitMiddleware(100)()
  async getStatus() {
    const enabled = process.env.NEXT_PUBLIC_BETTER_UPTIME_ENABLED === "true";
    const key = process.env.BETTER_UPTIME_KEY;

    if (!enabled || !key) {
      return {
        status: "disabled",
      };
    }

    return await fetch("https://betteruptime.com/api/v2/monitors", {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        const status = res.data.every(
          (site: { attributes: { status: string } }) =>
            site.attributes.status === "up"
        )
          ? "up"
          : "problems";

        return {
          status,
        };
      })
      .catch((err) => {
        return {
          status: "disabled",
        };
      });
  }
}

export default createHandler(DocRouter);
