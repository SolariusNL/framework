import { FastFlag } from "@prisma/client";
import {
  Body,
  Get,
  Post,
  createHandler,
} from "@storyofams/next-api-decorators";
import IResponseBase from "@/types/api/IResponseBase";
import { AdminAuthorized } from "@/util/api/authorized";
import prisma from "@/util/prisma";

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

  @Post("/")
  @AdminAuthorized()
  async createFlag(@Body() body: GenericFastFlag[]) {
    const flags = await prisma.fastFlag.findMany({
      select: {
        name: true,
        id: true,
      },
    });

    for (const flag of body) {
      if (flags.find((f) => f.name === flag.name)) {
        await prisma.fastFlag.update({
          where: {
            id: flags.find((f) => f.name === flag.name)?.id,
          },
          data: {
            value: String(flag.value),
          },
        });
      }
    }

    return <IResponseBase>{
      success: true,
    };
  }
}

export default createHandler(FastFlagsRouter);
