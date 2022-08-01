import { createHandler, Get } from "@storyofams/next-api-decorators";
import Authorized, { Account } from "../../../util/api/authorized";
import type { User } from "../../../util/prisma-types";

class UserRouter {
  @Get("/@me")
  @Authorized()
  public async getMe(@Account() user: User) {
    return user;
  }
}

export default createHandler(UserRouter);
