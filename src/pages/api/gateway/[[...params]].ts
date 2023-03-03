import { createHandler, Get, Res } from "@storyofams/next-api-decorators";
import http from "http";
import { NextApiResponse } from "next";
import { Server } from "socket.io";
import Authorized from "../../../util/api/authorized";
import { getAccountFromSession } from "../../../util/auth";
import { COSMIC_SOCKETS } from "../../../util/constants";
import logger from "../../../util/logger";
import prisma from "../../../util/prisma";

type NextApiResponseWithIO = NextApiResponse & {
  socket: {
    server: {
      io: Server;
    };
  };
};

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
              result.toId === socket.data.user.id
            ) {
              socket.emit("@user/chat", result);
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

          COSMIC_SOCKETS.set(
            socket.data.cosmic.connection.id,
            socket.disconnect
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

            COSMIC_SOCKETS.delete(socket.data.cosmic.connection.id);
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
        }
      });
    }

    res.end();
  }
}

export default createHandler(GatewayRouter);
