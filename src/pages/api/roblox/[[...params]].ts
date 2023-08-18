import { Get, Query, createHandler } from "@storyofams/next-api-decorators";

class RobloxRouter {
  @Get("/convert")
  public async authorizeAccount(@Query("code") code: string) {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_ROBLOX_CLIENT_ID,
      redirect_uri: `${process.env.NEXT_PUBLIC_ROBLOX_REDIRECT_URI}/api/roblox/convert`,
      response_type: "code",
      scope: "openid",
      code: code,
      grant_type: "authorization_code",
      client_secret: process.env.ROBLOX_CLIENT_SECRET,
    } as Record<string, string>);

    const response = await fetch("https://apis.roblox.com/oauth/v1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const json = (await response.json()) as {
      access_token: string;
    };

    if (!json.access_token) {
      throw new Error("Invalid access token");
    }

    const userResponse = await fetch(
      "https://apis.roblox.com/oauth/v1/userinfo",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${json.access_token}`,
        },
      }
    );

    const userJson = await userResponse.json();

    return userJson;
  }
}

export default createHandler(RobloxRouter);
