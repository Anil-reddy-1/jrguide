import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";

export const roleAuth = (...allowedRoles: Array<"employee" | "hr" | "admin">) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("User is not authenticated"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError("You do not have permission to access this resource"));
    }

    return next();
  };
};
