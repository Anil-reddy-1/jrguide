import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { Express } from "express";
import { env } from "../config/env.js";

export const registerSecurityMiddleware = (app: Express) => {
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
};
