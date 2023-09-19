import IResponseBase from "@/types/api/IResponseBase";
import Authorized, { Account } from "@/util/api/authorized";
import { assetFrontendInclude } from "@/util/includes";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import { AssetFrontend } from "@/util/types";
import {
  Body,
  Get,
  Param,
  Post,
  createHandler,
} from "@storyofams/next-api-decorators";
import { z } from "zod";

type LicenseHolderProperty = "name" | "location" | "id";
export type LicenseHolderDetails = Record<LicenseHolderProperty, string>;
export type GetSoundsResponse = IResponseBase<{
  sounds: AssetFrontend[];
}>;
export type GetSoundLicenseHolderNamesResponse = IResponseBase<{
  licenseHolderNames: LicenseHolderDetails[];
}>;
export type GetSoundLicenseHolderResponse = IResponseBase<{
  licenseHolder: LicenseHolderDetails;
}>;

const uploadSoundFieldsSchema = z
  .object({
    artist: z.string().min(1).max(100),
    album: z.string().min(1).max(100),
    year: z.string().min(1).max(100),
  })
  .strict();
const uploadSoundSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  duration: z.number().int().min(1),
  fields: uploadSoundFieldsSchema.optional(),
  licensed: z.boolean().optional(),
  licenseHolderId: z.string().uuid().optional(),
});

class SoundRouter {
  @Post("/create")
  @Authorized()
  public async uploadSound(
    @Body() body: z.infer<typeof uploadSoundSchema>,
    @Account() user: User
  ) {
    const { name, description, duration, fields, licenseHolderId, licensed } =
      uploadSoundSchema.parse(body);

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
          createMany: {
            data: [
              {
                key: "Duration",
                value: `${formattedMinutes}:${formattedSeconds}`,
              },
              ...(fields
                ? [
                    {
                      key: "Artist",
                      value: fields.artist,
                    },
                    {
                      key: "Album",
                      value: fields.album,
                    },
                    {
                      key: "Year",
                      value: fields.year,
                    },
                  ]
                : []),
            ],
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
        ...(licensed
          ? {
              licensedTo: {
                connect: {
                  id: licenseHolderId,
                },
              },
            }
          : {}),
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

  @Get("/licenses/holders")
  @Authorized()
  public async getSoundLicenseHolderNames(@Account() user: User) {
    const licenseHolderNames = await prisma.soundLicenseHolder.findMany({
      select: {
        name: true,
        location: true,
        id: true,
      },
    });

    return <GetSoundLicenseHolderNamesResponse>{
      success: true,
      data: {
        licenseHolderNames,
      },
    };
  }

  @Get("/licenses/holders/:id")
  @Authorized()
  public async getSoundLicenseHolder(@Param("id") id: string) {
    const licenseHolder = await prisma.soundLicenseHolder.findUnique({
      where: {
        id,
      },
    });

    if (!licenseHolder) {
      return <GetSoundLicenseHolderResponse>{
        success: false,
        error: {
          message: "License holder not found",
        },
      };
    }

    return <GetSoundLicenseHolderResponse>{
      success: true,
      data: {
        licenseHolder,
      },
    };
  }
}

export default createHandler(SoundRouter);
