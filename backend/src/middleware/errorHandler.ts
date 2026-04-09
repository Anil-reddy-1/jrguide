import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors.js";
import { sendError } from "../utils/response.js";
import logger from "../utils/logger.js";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.details);
  }

  logger.error("Unhandled error", err);
  return sendError(res, "Internal server error", 500);
};
