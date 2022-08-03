import {
  createHandler,
  Post,
  UploadedFile,
  UseMiddleware,
} from "@storyofams/next-api-decorators";
import multer from "multer";
import { NextApiRequest } from "next";
import path from "path";
import Authorized, { Account } from "../../../util/api/authorized";
import { getAccountFromSession } from "../../../util/authorizedRoute";
import type { User } from "../../../util/prisma-types";

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

      cb(null, user?.username + ".png");
    },
  }),
  fileFilter: imageOnly,
}).single("avatar");

class MediaRouter {
  @Post("/upload/avatar")
  @Authorized()
  @UseMiddleware(avatars)
  async uploadAvatar(@Account() account: User, @UploadedFile() avatar: any) {
    return {
      avatar: `/avatars/${account.username}.png`,
      success: true,
    };
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default createHandler(MediaRouter);
