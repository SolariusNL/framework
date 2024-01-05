import IResponseBase from "@/types/api/IResponseBase";
import Authorized, { Account } from "@/util/api/authorized";
import { assetFrontendInclude } from "@/util/includes";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import { AssetFrontend } from "@/util/types";
import {
  Body,
  Get,
  Post,
  createHandler,
} from "@solariusnl/next-api-decorators";
import { z } from "zod";

export type GetDecalsResponse = IResponseBase<{
  decals: AssetFrontend[];
}>;

const uploadDecalSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
});

class DecalRouter {
  @Post("/create")
  @Authorized()
  public async uploadDecal(
    @Body() body: z.infer<typeof uploadDecalSchema>,
    @Account() user: User
  ) {
    const { name, description } = uploadDecalSchema.parse(body);

    const decal = await prisma.decal.create({
      data: {
        name,
        description,
        author: {
          connect: {
            id: user.id,
          },
        },
        apartOf: {
          connectOrCreate: {
            where: {
              userId: user.id,
            },
            create: {
              userId: user.id,
            },
          },
        },
      },
    });

    return <IResponseBase>{
      success: true,
      data: {
        decal,
      },
    };
  }

  @Get("/my")
  @Authorized()
  public async getDecals(@Account() user: User) {
    const decals = (await prisma.decal.findMany({
      where: {
        authorId: user.id,
      },
      include: assetFrontendInclude,
    })) as never as AssetFrontend[];

    return <GetDecalsResponse>{
      success: true,
      data: {
        decals,
      },
    };
  }
}

export default createHandler(DecalRouter);
