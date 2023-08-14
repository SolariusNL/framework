import IResponseBase from "@/types/api/IResponseBase";
import Authorized, { Account } from "@/util/api/authorized";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import { Body, Post, createHandler } from "@storyofams/next-api-decorators";
import { z } from "zod";

const uploadSoundSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
});

class SoundRouter {
  @Post("/create")
  @Authorized()
  public async uploadSound(
    @Body() body: z.infer<typeof uploadSoundSchema>,
    @Account() user: User
  ) {
    const { name, description } = uploadSoundSchema.parse(body);

    const sound = await prisma.sound.create({
      data: {
        name,
        description,
        audioUri: "/",
        author: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return <IResponseBase>{
      success: true,
      data: {
        sound,
      },
    };
  }
}

export default createHandler(SoundRouter);
