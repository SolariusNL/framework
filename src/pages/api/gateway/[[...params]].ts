import { createHandler, Get, Res } from "@storyofams/next-api-decorators";
import http from "http";
import { NextApiResponse } from "next";
import { Server } from "socket.io";
import Authorized from "../../../util/api/authorized";
import { getAccountFromSession } from "../../../util/authorizedRoute";
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
        if (!token) {
          return next(new Error("Authentication error"));
        }

        const account = await getAccountFromSession(token);
        if (!account) {
          return next(new Error("Authentication error"));
        }
        socket.data.user = account;
        next();
      });

      io.on("connection", (socket) => {
        logger().recv("Socket connected with id: " + socket.id);
        socket.on("disconnect", () => {
          logger().recv("Socket disconnected with id: " + socket.id);
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
      });
    }

    res.end();
  }
}

export default createHandler(GatewayRouter);
