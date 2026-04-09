import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { createSocketServer } from "./config/socket.js";
import logger from "./utils/logger.js";
import "./config/firebase.js";
import "./config/brevo.js";
import "./config/ai.js";

const app = createApp();
const httpServer = createServer(app);
const io = createSocketServer(httpServer);

io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
});

httpServer.listen(env.PORT, () => {
  logger.info(`Backend server listening on port ${env.PORT}`);
});
