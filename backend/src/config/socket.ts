import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "./env.js";

export const createSocketServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join:user", (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on("join:role", (role: string) => {
      socket.join(`role:${role}`);
    });
  });

  return io;
};
