import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import { ValidationError } from "../utils/errors.js";

export const validateBody = <T>(schema: z.ZodType<T>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(new ValidationError("Request payload is invalid", parsed.error.flatten()));
    }

    req.body = parsed.data;
    return next();
  };
};
