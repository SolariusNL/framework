import { createHandler, Get } from "@storyofams/next-api-decorators";
import { readFile } from "fs/promises";
import fetch from "node-fetch";
import { RateLimitMiddleware } from "../../../util/rateLimit";

interface BetterUptimeResponse {
  data: Array<{
    attributes: {
      status: string;
    };
  }>;
}

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
    let status = "disabled";

    if (!enabled || !key) {
      return {
        status: "disabled",
      };
    }

    await fetch("https://betteruptime.com/api/v2/monitors", {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        const { data } = res as BetterUptimeResponse;

        const retrieved = data.every(
          (site: { attributes: { status: string } }) =>
            site.attributes.status === "up"
        )
          ? "up"
          : "problems";

        status = retrieved;
      });

    return {
      status,
    };
  }
}

export default createHandler(DocRouter);
