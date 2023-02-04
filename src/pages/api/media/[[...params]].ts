import {
  createHandler,
  Param,
  Post,
  UseMiddleware,
} from "@storyofams/next-api-decorators";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import Authorized, { Account } from "../../../util/api/authorized";
import { getAccountFromSession } from "../../../util/authorizedRoute";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";

export const config = {
  api: {
    bodyParser: false,
  },
};

const convertToWebp = (file: any) => {
  return sharp(file)
    .webp({ quality: 95, alphaQuality: 95, lossless: true })
    .toBuffer()
    .then((data) => data)
    .catch((err) => {
      console.log(err);
      return file;
    });
};

const imageOnly = (req: any, file: any, callback: any) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
    return callback(new Error("Only images are allowed"));
  }

  convertToWebp(file).then((data) => {
    file.buffer = data;
  });

  callback(null, true);
};

const createMulter = (
  destination: string,
  nameFunction: (req: any, file: any, cb: any) => any
) =>
  multer({
    limits: {
      fileSize: 12 * 1024 * 1024,
    },
    storage: multer.diskStorage({
      destination: `./public/${destination}`,
      filename: nameFunction,
    }),
    fileFilter: imageOnly,
  });

const avatars = createMulter("avatars", async (req, file, cb) => {
  const user = await getAccountFromSession(
    String(req.headers["authorization"])
  );

  await prisma.user.update({
    where: { id: user?.id },
    data: {
      avatarUri: `/avatars/${String(user?.username)}.webp`,
    },
  });

  cb(null, user?.username + ".webp");
});

const gameThumbnails = createMulter("thumbnails", async (req, file, cb) => {
  const user = await getAccountFromSession(
    String(req.headers["authorization"])
  );

  if (!req.params.gameId) return cb(new Error("No game id provided"), "");

  const game = await prisma.game.findFirst({
    where: {
      id: Number(req.params.gameId),
      authorId: user?.id,
    },
  });

  if (!game) return cb(new Error("Game not found"), "");
  if (!Number.isInteger(Number(req.params.gameId)))
    return cb(new Error("Invalid game id"), "");

  await prisma.game.update({
    where: { id: Number(req.params.gameId) },
    data: {
      gallery: {
        set: [`/thumbnails/${req.params.gameId}.webp`],
      },
    },
  });

  cb(null, `${req.params.gameId}.webp`);
});

const gameIcons = createMulter("icons", async (req, file, cb) => {
  const user = await getAccountFromSession(
    String(req.headers["authorization"])
  );

  if (!req.params.gameId) return cb(new Error("No game id provided"), "");

  const game = await prisma.game.findFirst({
    where: {
      id: Number(req.params.gameId),
      authorId: user?.id,
    },
  });

  if (!game) return cb(new Error("Game not found"), "");
  if (!Number.isInteger(Number(req.params.gameId)))
    return cb(new Error("Invalid game id"), "");

  await prisma.game.update({
    where: {
      id: Number.parseInt(req.params.gameId),
    },
    data: {
      iconUri: `/icons/${game.id}.webp`,
    },
  });

  cb(null, game.id + ".webp");
});

const gamepassIcons = createMulter("gamepass", async (req, file, cb) => {
  const user = await getAccountFromSession(
    String(req.headers["authorization"])
  );

  if (!req.params.gamepassId) return cb(new Error("No game id provided"), "");

  const gamepass = await prisma.gamepass.findFirst({
    where: {
      id: String(req.params.gamepassId),
      game: {
        authorId: user?.id,
      },
    },
  });

  if (!gamepass) return cb(new Error("Gamepass not found"), "");
  if (!String(req.params.gamepassId))
    return cb(new Error("Invalid gamepass id"), "");

  await prisma.gamepass.update({
    where: {
      id: String(req.params.gamepassId),
    },
    data: {
      iconUri: `/gamepass/${gamepass.id}.webp`,
    },
  });

  cb(null, gamepass.id + ".webp");
});

class MediaRouter {
  @Post("/upload/avatar")
  @Authorized()
  @UseMiddleware(avatars.single("avatar"))
  async uploadAvatar(@Account() account: User) {
    return {
      avatar: `/avatars/${account.username}.webp`,
      success: true,
    };
  }

  @Post("/upload/thumbnail/:gameId")
  @Authorized()
  @UseMiddleware(gameThumbnails.single("thumbnail"))
  async uploadThumbnail(
    @Account() account: User,
    @Param("gameId") gameId: number
  ) {
    return {
      thumbnail: `/thumbnails/${gameId}.webp`,
      success: true,
    };
  }

  @Post("/upload/icon/:gameId")
  @Authorized()
  @UseMiddleware(gameIcons.single("icon"))
  async uploadIcon(@Account() account: User, @Param("gameId") gameId: number) {
    return {
      icon: `/icons/${gameId}.webp`,
      success: true,
    };
  }

  @Post("/upload/gamepass/:gamepassId")
  @Authorized()
  @UseMiddleware(gamepassIcons.single("gamepass"))
  async uploadGamepassIcon(
    @Account() account: User,
    @Param("gamepassId") gamepassId: string
  ) {
    return {
      icon: `/gamepass/${gamepassId}.webp`,
      success: true,
    };
  }
}

export default createHandler(MediaRouter);
