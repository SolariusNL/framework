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
} from "@storyofams/next-api-decorators";
import { z } from "zod";

export type GetSoundsResponse = IResponseBase<{
  sounds: AssetFrontend[];
}>;

const uploadSoundSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  duration: z.number().int().min(1),
});

class SoundRouter {
  @Post("/create")
  @Authorized()
  public async uploadSound(
    @Body() body: z.infer<typeof uploadSoundSchema>,
    @Account() user: User
  ) {
    const { name, description, duration } = uploadSoundSchema.parse(body);

    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

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
        rows: {
          create: {
            key: "Duration",
            value: `${formattedMinutes}:${formattedSeconds}`,
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
        sound,
      },
    };
  }

  @Get("/my")
  @Authorized()
  public async getSounds(@Account() user: User) {
    const sounds = (await prisma.sound.findMany({
      where: {
        authorId: user.id,
      },
      include: assetFrontendInclude,
    })) as never as AssetFrontend[];

    return <GetSoundsResponse>{
      success: true,
      data: {
        sounds,
      },
    };
  }
}

export default createHandler(SoundRouter);
