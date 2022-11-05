import {
  createHandler,
  Param,
  Post,
  UseMiddleware,
} from "@storyofams/next-api-decorators";
import multer from "multer";
import path from "path";
import Authorized, { Account } from "../../../util/api/authorized";
import { getAccountFromSession } from "../../../util/authorizedRoute";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";

export const config = {
  api: {
    bodyParser: false,
  },
};

const imageOnly = (req: any, file: any, callback: any) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
    return callback(new Error("Only images are allowed"));
  }

  callback(null, true);
};

const avatars = multer({
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  storage: multer.diskStorage({
    destination: "./public/avatars",
    filename: async (req, file, cb) => {
      const user = await getAccountFromSession(
        String(req.headers["authorization"])
      );

      await prisma.user.update({
        where: { id: user?.id },
        data: {
          avatarUri: `/avatars/${String(user?.username)}.png`,
        },
      });
      cb(null, user?.username + ".png");
    },
  }),
  fileFilter: imageOnly,
}).single("avatar");

const gameThumbnails = multer({
  limits: {
    fileSize: 12 * 1024 * 1024,
  },
  storage: multer.diskStorage({
    destination: "./public/thumbnails",
    filename: async (req, file, cb) => {
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
          gallery: {
            set: [`/thumbnails/${game.id}.png`],
          },
        },
      });

      cb(null, game.id + ".png");
    },
  }),
  fileFilter: imageOnly,
}).single("thumbnail");

const gameIcon = multer({
  limits: {
    fileSize: 12 * 1024 * 1024,
  },
  storage: multer.diskStorage({
    destination: "./public/icons",
    filename: async (req, file, cb) => {
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
          iconUri: `/icons/${game.id}.png`,
        },
      });

      cb(null, game.id + ".png");
    },
  }),
  fileFilter: imageOnly,
}).single("icon");

class MediaRouter {
  @Post("/upload/avatar")
  @Authorized()
  @UseMiddleware(avatars)
  async uploadAvatar(@Account() account: User) {
    return {
      avatar: `/avatars/${account.username}.png`,
      success: true,
    };
  }

  @Post("/upload/thumbnail/:gameId")
  @Authorized()
  @UseMiddleware(gameThumbnails)
  async uploadThumbnail(
    @Account() account: User,
    @Param("gameId") gameId: number
  ) {
    return {
      thumbnail: `/thumbnails/${gameId}.png`,
      success: true,
    };
  }

  @Post("/upload/icon/:gameId")
  @Authorized()
  @UseMiddleware(gameIcon)
  async uploadIcon(@Account() account: User, @Param("gameId") gameId: number) {
    return {
      icon: `/icons/${account.username}.png`,
      success: true,
    };
  }
}

export default createHandler(MediaRouter);
