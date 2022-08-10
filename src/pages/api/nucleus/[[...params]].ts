import { createHandler, Header, Post } from "@storyofams/next-api-decorators";
import prisma from "../../../util/prisma";

class NucleusRouter {
  @Post("/auth")
  public async authorize(@Header("authorization") authorization: string) {
    const match = await prisma.nucleusKey.findFirst({
      where: {
        key: authorization,
      },
    });

    if (!match) {
      return {
        success: false,
        message: "Invalid authorization key",
      };
    } else {
      return {
        success: true,
        message: "Authorized with Nucleus",
      };
    }
  }
}

export default createHandler(NucleusRouter);
