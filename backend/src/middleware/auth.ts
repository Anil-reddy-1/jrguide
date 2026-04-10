import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { firestore, firebaseAuth } from "../config/firebase.js";
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
      let resolvedRole = decoded.role as "employee" | "hr" | "admin" | undefined;

      if (!resolvedRole) {
        const doc = await firestore.collection("users").doc(decoded.uid).get();
        const firestoreRole = doc.data()?.role;
        if (firestoreRole === "employee" || firestoreRole === "hr" || firestoreRole === "admin") {
          resolvedRole = firestoreRole;
        }
      }

      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        role: resolvedRole ?? "employee",
        firebaseToken: decoded,
      };
      return next();
    } catch {
      const decodedJwt = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
      let resolvedRole = decodedJwt.role;

      if (!resolvedRole) {
        const doc = await firestore.collection("users").doc(decodedJwt.uid).get();
        const firestoreRole = doc.data()?.role;
        if (firestoreRole === "employee" || firestoreRole === "hr" || firestoreRole === "admin") {
          resolvedRole = firestoreRole;
        }
      }

      req.user = {
        uid: decodedJwt.uid,
        email: decodedJwt.email,
        role: resolvedRole ?? "employee",
      };
      return next();
    }
  } catch (error) {
    return next(error instanceof UnauthorizedError ? error : new UnauthorizedError());
  }
};
