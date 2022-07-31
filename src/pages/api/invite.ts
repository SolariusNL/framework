import { Body, createHandler, Get, Post } from "@storyofams/next-api-decorators";
import prisma from "../../util/prisma";

interface ValidateInviteBody {
  inviteCode: string;
}

class InviteHandler {
  @Post()
  public async validateInvite(@Body() body: ValidateInviteBody) {
    const match = await prisma.user.findFirst({
      where: {
        inviteCode: body.inviteCode,
      },
    });

    if (!match) {
      return {
        status: "error",
        message: "Invalid invite code",
      };
    }

    return {
      success: true,
      message: "Invite code is valid",
    };
  }
}

export default createHandler(InviteHandler);