import { Get, Res, createHandler } from "@storyofams/next-api-decorators";
import http from "http";
import { NextApiResponse } from "next";
import { Server } from "socket.io";
import { EventEmitter } from "stream";
import Authorized from "../../../util/api/authorized";
import { getAccountFromSession } from "../../../util/auth";
import logger from "../../../util/logger";
import prisma from "../../../util/prisma";

type NextApiResponseWithIO = NextApiResponse & {
  socket: {
    server: {
      io: Server;
    };
  };
};

const events = new EventEmitter();

export const onSocketEvent = <T>(
  event: Events,
  callback: (payload: T) => void
) => {
  events.on(event, callback);
};

export const emitSocketEvent = <T>(event: Events, payload: T) => {
  events.emit(event, payload);
};

export enum Events {
  SHUTDOWN_COSMIC = "shutdown-cosmic",
}

class GatewayRouter {
  @Get("/initialize")
  @Authorized()
  public async initializeSocket(@Res() res: NextApiResponseWithIO) {
    if (res.socket?.server.io) {
      logger().info("Socket already initialized");
    } else {
      const io = new Server(res.socket.server as unknown as http.Server, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
      });
      res.socket.server.io = io;

      io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        const type: "user" | "cosmic" = socket.handshake.auth.type || "user";
        if (!token) {
          return next(new Error("Authentication error"));
        }

        if (type === "user") {
          const account = await getAccountFromSession(token);
          if (!account) {
            return next(new Error("Authentication error"));
          }
          socket.data.user = account;
        } else if (type === "cosmic") {
          const key = await prisma.nucleusKey.findFirst({
            where: {
              key: String(token),
            },
            include: {
              connection: {
                include: { game: true },
              },
            },
          });

          if (!key) {
            return next(
              new Error(
                "Authentication error - Invalid Nucleus authentication key"
              )
            );
          }

          socket.data.cosmic = key;
          onSocketEvent(
            Events.SHUTDOWN_COSMIC,
            async (payload: { connectionId: string }) => {
              if (payload.connectionId === key.connectionId) {
                socket.emit("@cosmic/shutdown", {});
              }
            }
          );

          await prisma.connection.update({
            where: {
              id: key.connectionId,
            },
            data: {
              reportedCores: socket.handshake.auth.system.cpuCores || 0,
              reportedMemoryGb: socket.handshake.auth.system.memoryGb || 0,
              reportedDiskGb: socket.handshake.auth.system.diskGb || 0,
              protocol: socket.handshake.auth.protocol,
            },
          });
        }
        next();
      });

      io.on("connection", async (socket) => {
        if (socket.data.user) {
          logger().recv(
            "Socket connected with id: " +
              socket.id +
              " for user " +
              socket.data.user.username
          );
          socket.on("disconnect", () => {
            logger().recv(
              "Socket disconnected with id: " +
                socket.id +
                " for user " +
                socket.data.user.username
            );
          });

          prisma.$use(async (params, next) => {
            const result = await next(params);
            if (params.model === "Notification" && params.action === "create") {
              if (socket.data.user.id === result.userId) {
                socket.emit("@user/notification", result);
              }
            }
            if (
              (params.model === "Session" && params.action === "delete") ||
              params.action === "deleteMany"
            ) {
              if (result.token === socket.handshake.auth.token) {
                socket.emit("@user/logout", {});
              }
            }
            if (
              params.model === "ChatMessage" &&
              params.action === "create" &&
              result.conversation.participants.some(
                (p: { id: number }) => p.id === socket.data.user.id
              ) &&
              result.authorId !== socket.data.user.id
            ) {
              socket.emit("@user/chat", result);
            }
            if (
              params.model === "ChatConversation" &&
              ["create", "update"].includes(params.action)
            ) {
              const before: {
                participants?: {
                  connect?: { id: number }[];
                  disconnect?: { id: number }[];
                };
                ownerId?: number;
                name?: string;
              } = params.args?.data;

              if (before.participants) {
                if (
                  before.participants.disconnect?.some(
                    (p: { id: number }) => p.id === socket.data.user.id
                  ) ||
                  (before.participants &&
                    before.participants.connect?.some(
                      (p: { id: number }) => p.id === socket.data.user.id
                    ))
                )
                  socket.emit("@user/chat/conversation", {
                    id: result.id,
                  });
              } else if (before.ownerId) {
                if (before.ownerId !== result.ownerId)
                  socket.emit("@user/chat/conversation/owner-changed", {
                    id: result.id,
                  });
              } else if (before.name) {
                if (before.name !== result.name)
                  socket.emit("@user/chat/conversation/name-changed", {
                    id: result.id,
                  });
              }
            }
            if (params.model === "ChatMessage" && params.action === "delete") {
              socket.emit("@user/chat/delete", {
                id: result.id,
              });
            }
            if (
              params.model === "User" &&
              params.action === "update" &&
              result.id === socket.data.user.id
            ) {
              socket.emit("@user/ban", {
                banned: result.banned,
              });
              if (result.warning && !result.warningViewed) {
                socket.emit("@user/warning", {});
              }
            }
            return result;
          });
        } else if (socket.data.cosmic) {
          logger().recv(
            "Socket connected with id: " +
              socket.id +
              " for Cosmic server " +
              socket.data.cosmic.connection.id
          );

          socket.emit("@cosmic/hello", {
            game: {
              id: socket.data.cosmic.connection.gameId,
              name: socket.data.cosmic.connection.game.name,
            },
          });

          await prisma.connection.update({
            where: {
              id: socket.data.cosmic.connection.id,
            },
            data: {
              online: true,
              hasConnected: true,
            },
          });

          socket.on("disconnect", async () => {
            logger().recv(
              "Socket disconnected with id: " +
                socket.id +
                " for Cosmic server " +
                socket.data.cosmic.id
            );
            await prisma.connection.update({
              where: {
                id: socket.data.cosmic.connection.id,
              },
              data: {
                online: false,
              },
            });

            const playing = await prisma.user.findMany({
              where: {
                playing: {
                  id: socket.data.cosmic.connection.gameId,
                },
              },
            });

            await prisma.game.update({
              where: {
                id: socket.data.cosmic.connection.gameId,
              },
              data: {
                playingUsers: {
                  disconnect: playing.map((p) => ({ id: p.id })),
                },
                playing: 0,
              },
            });
          });

          socket.on("@cosmic/stdout", async (data) => {
            await prisma.nucleusStdout.create({
              data: {
                connection: {
                  connect: {
                    id: socket.data.cosmic.connection.id,
                  },
                },
                line: data,
              },
            });
          });

          socket.on("@cosmic/set-commands", async (data) => {
            await prisma.cosmicCommand.deleteMany({
              where: {
                connId: socket.data.cosmic.connection.id,
              },
            });
            await prisma.cosmicCommand.createMany({
              data: data.map(
                (d: { name: string; description: string; usage: string }) => ({
                  name: d.name,
                  description: d.description,
                  usage: d.usage,
                  connId: socket.data.cosmic.connection.id,
                })
              ),
            });
            const commands = await prisma.cosmicCommand.findMany({
              where: {
                connId: socket.data.cosmic.connection.id,
              },
            });
            const commandNames = commands.map((c) => c.name);
            const uniqueCommandNames = [...new Set(commandNames)];
            const duplicateCommandNames = commandNames.filter(
              (c) => !uniqueCommandNames.includes(c)
            );
            await prisma.cosmicCommand.deleteMany({
              where: {
                name: {
                  in: duplicateCommandNames,
                },
              },
            });
          });
        }
      });
    }

    res.end();
  }
}

export default createHandler(GatewayRouter);
