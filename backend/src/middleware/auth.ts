import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { firebaseAuth } from "../config/firebase.js";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../utils/errors.js";

type TokenPayload = {
  uid: string;
  email?: string;
  role?: "employee" | "hr" | "admin";
};

const resolveBearerToken = (header?: string) => {
  if (!header || !header.startsWith("Bearer ")) {
    return undefined;
  }

  return header.slice(7);
};

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = resolveBearerToken(req.headers.authorization);
    if (!token) {
      throw new UnauthorizedError("Missing access token");
    }

    try {
      const decoded = await firebaseAuth.verifyIdToken(token);
      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        role: (decoded.role as "employee" | "hr" | "admin") ?? "employee",
        firebaseToken: decoded,
      };
      return next();
    } catch {
      const decodedJwt = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
      req.user = {
        uid: decodedJwt.uid,
        email: decodedJwt.email,
        role: decodedJwt.role ?? "employee",
      };
      return next();
    }
  } catch (error) {
    return next(error instanceof UnauthorizedError ? error : new UnauthorizedError());
  }
};
