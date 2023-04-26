import { FastFlag } from "@prisma/client";
import { Get, createHandler } from "@storyofams/next-api-decorators";
import IResponseBase from "../../../types/api/IResponseBase";
import prisma from "../../../util/prisma";

export type GenericFastFlag = Pick<FastFlag, "name" | "value" | "valueType">;

class FastFlagsRouter {
  @Get("/")
  async getFlags() {
    const flags = await prisma.fastFlag.findMany({
      select: {
        name: true,
        value: true,
        valueType: true,
      },
    });
    return <IResponseBase<{ flags: GenericFastFlag[] }>>{
      success: true,
      data: {
        flags,
      },
    };
  }
}

export default createHandler(FastFlagsRouter);
