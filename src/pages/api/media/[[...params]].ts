import IResponseBase from "@/types/api/IResponseBase";
import Authorized, { Account } from "@/util/api/authorized";
import buckets from "@/util/buckets";
import cast from "@/util/cast";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import { RateLimitMiddleware } from "@/util/rate-limit";
import { AssetType, prismaAssetTypeMap } from "@/util/types";
import { CatalogItem, Prisma } from "@prisma/client";
import {
  Download,
  Get,
  Middleware,
  NextFunction,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseMiddleware,
  createHandler,
} from "@solariusnl/next-api-decorators";
import formidable, { Formidable } from "formidable";
import { createReadStream, existsSync } from "fs";
import { rename, stat } from "fs/promises";
import type { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";
import sharp from "sharp";

export const config = {
  api: {
    bodyParser: false,
  },
};

type NextApiRequestEx = NextApiRequest & {
  form?: Record<string, any>;
};

type UploadThumbnailInput = {
  gameId: number;
};
type UploadIconInput = {
  gameId: number;
};
type UploadGamepassInput = {
  gamepassId: string;
};
type UploadTeamInput = {
  teamId: string;
};
type UploadConversationInput = {
  convoId: string;
};
type UploadAssetInput = {
  assetId: string;
};
type UploadSoundInput = {
  soundId: string;
};

type UploadInput =
  | UploadThumbnailInput
  | UploadIconInput
  | UploadGamepassInput
  | UploadTeamInput
  | UploadConversationInput
  | UploadAssetInput
  | UploadSoundInput;

type UploadAssetQuery = {
  type: AssetType;
};

type UploadQuery = UploadAssetQuery;

const extensions = [
  ".png",
  ".jpg",
  ".webp",
  ".jpeg",
  ".mp3",
  ".wav",
  ".ogg",
  ".m4a",
  ".gif",
] as const;
const mimeTypes = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".jpeg": "image/jpeg",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".gif": "image/gif",
} as const;
type Bucket = (typeof buckets)[number];
type Extension = (typeof extensions)[number];
type MimeType = (typeof mimeTypes)[Extension];

const defaultImageConfig = {
  acceptedExtensions: [".png", ".jpg", ".webp", ".jpeg", ".gif"],
  acceptedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
} as { acceptedExtensions: Extension[]; acceptedMimeTypes: MimeType[] };
const ProhibitedQuery = <IResponseBase>{
  success: false,
  message:
    "You are not permitted to upload to this bucket, or you did not supply the correct parameters",
};

const bucketData: Record<
  Bucket,
  {
    acceptedExtensions: Extension[];
    acceptedMimeTypes: MimeType[];
  }
> = {
  avatars: defaultImageConfig,
  thumbnails: defaultImageConfig,
  icons: defaultImageConfig,
  gamepasses: defaultImageConfig,
  teams: defaultImageConfig,
  conversations: defaultImageConfig,
  assets: defaultImageConfig,
  sounds: {
    acceptedExtensions: [".mp3", ".wav", ".ogg", ".m4a"],
    acceptedMimeTypes: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"],
  },
};
const databaseOperations: Record<
  Bucket,
  (
    input: any,
    user: User,
    file: formidable.File,
    params?: any
  ) => Promise<string | IResponseBase>
> = {
  avatars: async (input, user, file, params) => {
    const name = `${user.username}.webp`;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        avatarUri: `/avatars/${name}?at=${Date.now()}`,
      },
    });
    return name;
  },
  thumbnails: async (input: UploadThumbnailInput, user, file, params) => {
    if (!input.gameId) return ProhibitedQuery;
    const game = await prisma.game.findFirst({
      where: { authorId: user.id, id: Number(input.gameId) },
    });
    if (!game) return ProhibitedQuery;
    const name = `${input.gameId}.webp`;
    await prisma.game.update({
      where: { id: Number(input.gameId) },
      data: {
        gallery: {
          set: [`/thumbnails/${name}?at=${Date.now()}`],
        },
      },
    });
    return name;
  },
  icons: async (input: UploadIconInput, user, file, params) => {
    if (!input.gameId) return ProhibitedQuery;
    const game = await prisma.game.findFirst({
      where: { authorId: user.id, id: Number(input.gameId) },
    });
    if (!game) return ProhibitedQuery;
    const name = `${input.gameId}.webp`;
    await prisma.game.update({
      where: { id: Number(input.gameId) },
      data: {
        iconUri: `/icons/${name}?at=${Date.now()}`,
      },
    });
    return name;
  },
  gamepasses: async (input: UploadGamepassInput, user, file, params) => {
    if (!input.gamepassId) return ProhibitedQuery;
    const gp = await prisma.gamepass.findFirst({
      where: { authorId: user.id, id: input.gamepassId },
    });
    if (!gp) return ProhibitedQuery;
    const name = `${input.gamepassId}.webp`;
    await prisma.gamepass.update({
      where: { id: input.gamepassId },
      data: {
        iconUri: `/gamepasses/${name}?at=${Date.now()}`,
      },
    });
    return name;
  },
  teams: async (input: UploadTeamInput, user, file, params) => {
    if (!input.teamId) return ProhibitedQuery;
    const team = await prisma.team.findFirst({
      where: { ownerId: user.id, id: input.teamId },
    });
    if (!team) return ProhibitedQuery;
    const name = `${input.teamId}.webp`;
    await prisma.team.update({
      where: { id: input.teamId },
      data: {
        iconUri: `/teams/${name}?at=${Date.now()}`,
      },
    });
    return name;
  },
  conversations: async (input: UploadConversationInput, user, file, params) => {
    if (!input.convoId) return ProhibitedQuery;
    const convo = await prisma.chatConversation.findFirst({
      where: { ownerId: user.id, id: input.convoId },
    });
    if (!convo) return ProhibitedQuery;
    const name = `${input.convoId}.webp`;
    await prisma.chatConversation.update({
      where: { id: input.convoId },
      data: {
        iconUri: `/conversations/${name}?at=${Date.now()}`,
      },
    });
    return name;
  },
  assets: async (
    input: UploadAssetInput,
    user,
    file,
    params: UploadAssetQuery
  ) => {
    if (!input.assetId) return ProhibitedQuery;
    if (!params.type) return ProhibitedQuery;

    const queryExecutor = prisma[prismaAssetTypeMap[params.type]] as never as {
      findFirst: (
        args: Prisma.CatalogItemFindFirstArgs
      ) => Promise<CatalogItem>;
      update: (args: Prisma.CatalogItemUpdateArgs) => Promise<CatalogItem>;
    };

    const asset = await queryExecutor.findFirst({
      where: {
        id: input.assetId,
        author: {
          id: user?.id,
        },
        canAuthorEdit: true,
      },
    });

    if (!asset) return ProhibitedQuery;
    const name = `${input.assetId}.webp`;

    await queryExecutor.update({
      where: { id: input.assetId },
      data: {
        previewUri: `/assets/${name}?at=${Date.now()}`,
      },
    });

    return name;
  },
  sounds: async (input: UploadSoundInput, user, file, params) => {
    if (!input.soundId) return ProhibitedQuery;
    const sound = await prisma.sound.findFirst({
      where: { authorId: user.id, id: input.soundId },
    });
    if (!sound) return ProhibitedQuery;
    const name = `${input.soundId}.${cast<formidable.File>(file)
      .originalFilename!.split(".")
      .pop()}`;
    await prisma.sound.update({
      where: { id: input.soundId },
      data: {
        audioUri: `/sounds/${name}?at=${Date.now()}`,
      },
    });

    return name;
  },
};

const getFileMiddleware: Middleware = async (
  req: NextApiRequestEx,
  res: NextApiResponse,
  next: NextFunction
) => {
  const data = (await new Promise((resolve, reject) => {
    const form = new Formidable();

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ err, fields, files });
    });
  })) as {
    err: Error;
    fields: formidable.Fields;
    files: formidable.Files;
  };

  const { files } = data;
  const file = cast<formidable.File>(files?.file![0]);
  const newFields = Object.fromEntries(
    Object.entries(data.fields).map(([key, value]) => [key, value![0]])
  );
  const bucket = newFields.bucket;

  if (!file)
    return res
      .status(400)
      .json(<IResponseBase>{ success: false, message: "No file provided" });
  if (!file.mimetype)
    return res
      .status(400)
      .json(<IResponseBase>{ success: false, message: "No mimetype provided" });
  if (!file.originalFilename)
    return res.status(400).json(<IResponseBase>{
      success: false,
      message: "No file name provided",
    });

  const extension = file.originalFilename.split(".").pop();
  if (!extension)
    return res.status(400).json(<IResponseBase>{
      success: false,
      message: "No file extension provided",
    });

  const mimeType = mimeTypes[`.${extension}` as Extension];
  if (!mimeType)
    return res.status(400).json(<IResponseBase>{
      success: false,
      message: "Invalid file extension",
    });

  const bucketConfig = bucketData[cast<Bucket>(bucket)];

  if (!bucketConfig)
    return res.status(400).json(<IResponseBase>{
      success: false,
      message: "Invalid bucket",
    });

  if (
    !bucketConfig.acceptedExtensions.includes(`.${extension}` as Extension) ||
    !bucketConfig.acceptedMimeTypes.includes(mimeType as MimeType)
  )
    return res.status(400).json(<IResponseBase>{
      success: false,
      message: "Invalid file type",
    });

  req.form = { ...newFields, file };

  next();
};

class MediaRouter {
  @Post("/upload")
  @Authorized()
  @UseMiddleware(getFileMiddleware)
  @RateLimitMiddleware(10)()
  async uploadAvatar(
    @Account() user: User,
    @Req() req: NextApiRequestEx,
    @Query() query: unknown
  ) {
    const { bucket, file } = req.form!;
    const params = query as UploadQuery;

    const operation = databaseOperations[cast<Bucket>(bucket)];
    if (!operation)
      return <IResponseBase>{
        success: false,
        message: "Invalid bucket provided",
      };

    const result = await operation(req.form!, user, file, params);
    if (typeof result === "string") {
      const path = join(
        process.cwd(),
        "data-storage",
        cast<Bucket>(bucket),
        result
      );

      if (cast<formidable.File>(file).mimetype!.startsWith("image")) {
        await sharp(cast<formidable.File>(file).filepath)
          .webp({ quality: 95, alphaQuality: 95, lossless: true })
          .toFile(path)
          .then((data) => data)
          .catch(() => {
            return <IResponseBase>{
              success: false,
              message: "Failed to write to disk",
            };
          });
      }

      await rename(cast<formidable.File>(file).filepath, join(path));

      return <IResponseBase>{
        success: true,
        message: "Successfully uploaded file",
      };
    }
    return result;
  }

  @Get("/local-file/:bucket/:name")
  @Download()
  public async getLocalFile(
    @Param("bucket") bucket: Bucket,
    @Param("name") name: string,
    @Res() response: NextApiResponse
  ) {
    if (process.env.NODE_ENV !== "development") return ProhibitedQuery;
    if (!buckets[cast<number>(bucket)])
      return <IResponseBase>{
        success: false,
        message: "Invalid bucket",
      };

    const path = join(process.cwd(), "data-storage", bucket, name);
    if (!existsSync(path))
      return <IResponseBase>{
        success: false,
        message: "No file exists in the provided bucket",
      };
    else {
      const fileStat = await stat(path);

      response.writeHead(200, {
        "Content-Length": fileStat.size,
      });

      const readStream = createReadStream(path);
      readStream.pipe(response);
    }
  }
}

export default createHandler(MediaRouter);
