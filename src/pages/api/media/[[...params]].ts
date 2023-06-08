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
import { getAccountFromSession } from "../../../util/auth";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";

export const config = {
  api: {
    bodyParser: false,
  },
};

const convertToWebp = (file: string) => {
  return sharp(file)
    .webp({ quality: 95, alphaQuality: 95, lossless: true })
    .toBuffer()
    .then((data) => data)
    .catch((err) => {
      console.log("Failed to convert to webp: ", err);
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
  nameFunction: (req: any, file: any, cb: any) => any,
  alternativeFilter?: (req: any, file: any, cb: any) => any
) =>
  multer({
    limits: {
      fileSize: 12 * 1024 * 1024,
    },
    storage: multer.diskStorage({
      destination: `./public/${destination}`,
      filename: nameFunction,
    }),
    fileFilter: alternativeFilter || imageOnly,
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

const teamIcons = createMulter("team", async (req, file, cb) => {
  const user = await getAccountFromSession(
    String(req.headers["authorization"])
  );

  if (!req.params.teamId) return cb(new Error("No team id provided"), "");

  const team = await prisma.team.findFirst({
    where: {
      id: String(req.params.teamId),
      ownerId: user?.id,
    },
  });

  if (!team) return cb(new Error("Team not found"), "");
  if (!String(req.params.teamId)) return cb(new Error("Invalid team id"), "");

  await prisma.team.update({
    where: {
      id: String(req.params.teamId),
    },
    data: {
      iconUri: `/team/${team.id}.webp`,
    },
  });

  cb(null, team.id + ".webp");
});

const convoIcons = createMulter("convo", async (req, file, cb) => {
  const user = await getAccountFromSession(
    String(req.headers["authorization"])
  );

  if (!req.params.convoId)
    return cb(new Error("No conversation id provided"), "");

  const conversation = await prisma.chatConversation.findFirst({
    where: {
      id: String(req.params.convoId),
      participants: {
        some: {
          id: user?.id,
        },
      },
    },
  });

  if (!conversation) return cb(new Error("Conversation not found"), "");
  if (!String(req.params.convoId))
    return cb(new Error("Invalid conversation id"), "");

  await prisma.chatConversation.update({
    where: {
      id: String(req.params.convoId),
    },
    data: {
      iconUri: `/convo/${conversation.id}.webp`,
    },
  });

  cb(null, conversation.id + ".webp");
});

const sounds = createMulter(
  "sounds",
  async (req, file, cb) => {
    const user = await getAccountFromSession(
      String(req.headers["authorization"])
    );

    if (!req.params.soundId) return cb(new Error("No sound id provided"), "");

    const sound = await prisma.sound.findFirst({
      where: {
        id: String(req.params.soundId),
        authorId: user?.id,
      },
    });

    if (!sound) return cb(new Error("Sound not found"), "");
    if (!String(req.params.soundId))
      return cb(new Error("Invalid sound id"), "");

    const extension = file.mimetype.split("/")[1];
    const validExtensions = ["mp3", "wav", "ogg", "mpeg", "webm", "aac"];

    if (!validExtensions.includes(extension))
      return cb(new Error("Invalid file type"), "");

    await prisma.sound.update({
      where: {
        id: String(req.params.soundId),
      },
      data: {
        audioUri: `/sounds/${sound.id}.${extension}`,
      },
    });

    cb(null, sound.id + ".webm");
  },
  (req, file, cb) => {
    if (!file.mimetype.startsWith("audio/")) {
      return cb(new Error("Invalid file type"));
    }

    cb(null, true);
  }
);

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

  @Post("/upload/team/:teamId")
  @Authorized()
  @UseMiddleware(teamIcons.single("team"))
  async uploadTeamIcon(
    @Account() account: User,
    @Param("teamId") teamId: string
  ) {
    return {
      icon: `/team/${teamId}.webp`,
      success: true,
    };
  }

  @Post("/upload/convo/:convoId")
  @Authorized()
  @UseMiddleware(convoIcons.single("convo"))
  async uploadConversationIcon(
    @Account() account: User,
    @Param("convoId") convoId: string
  ) {
    return {
      icon: `/convo/${convoId}.webp`,
      success: true,
    };
  }

  @Post("/upload/sound/:soundId")
  @Authorized()
  @UseMiddleware(sounds.single("sound"))
  async uploadSound(
    @Account() account: User,
    @Param("soundId") soundId: string
  ) {
    return {
      sound: `/sounds/${soundId}.webm`,
      success: true,
    };
  }
}

export default createHandler(MediaRouter);
