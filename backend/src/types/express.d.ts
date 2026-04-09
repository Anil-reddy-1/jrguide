import type { DecodedIdToken } from "firebase-admin/auth";

declare global {
  namespace Express {
    interface UserContext {
      uid: string;
      email?: string;
      role: "employee" | "hr" | "admin";
      firebaseToken?: DecodedIdToken;
    }

    interface Request {
      user?: UserContext;
    }
  }
}

export {};
