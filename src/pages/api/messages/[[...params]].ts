import { createHandler, Get, Post } from "@storyofams/next-api-decorators";
import Authorized from "../../../util/api/authorized";

class MessageRouter {
  @Post("/new/:recipientId")
  @Authorized()
  public async newMessage() {
    return {
      status: 410,
      success: false,
      message:
        "Messages V1 is deprecated. This endpoint will eventually be rewritten for the upcoming V2.",
    };
  }

  @Get("/my")
  @Authorized()
  public async getMyMessages() {
    return {
      status: 410,
      success: false,
      message:
        "Messages V1 is deprecated. This endpoint will eventually be rewritten for the upcoming V2.",
    };
  }

  @Post("/msg/:messageId/read")
  @Authorized()
  public async readMessage() {
    return {
      status: 410,
      success: false,
      message:
        "Messages V1 is deprecated. This endpoint will eventually be rewritten for the upcoming V2.",
    };
  }

  @Post("/msg/:messageId/archive")
  @Authorized()
  public async archiveMessage() {
    return {
      status: 410,
      success: false,
      message:
        "Messages V1 is deprecated. This endpoint will eventually be rewritten for the upcoming V2.",
    };
  }
}

export default createHandler(MessageRouter);
