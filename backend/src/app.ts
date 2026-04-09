import express from "express";
import morgan from "morgan";
import rootRouter from "./routes/index.js";
import { registerSecurityMiddleware } from "./middleware/security.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const createApp = () => {
  const app = express();

  registerSecurityMiddleware(app);
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));

  app.use(rootRouter);
  app.use(errorHandler);

  return app;
};
