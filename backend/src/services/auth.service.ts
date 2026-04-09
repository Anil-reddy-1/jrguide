import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { firestore } from "../config/firebase.js";

export const createAccessToken = (payload: {
  uid: string;
  email: string;
  role: "employee" | "hr" | "admin";
}) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "8h",
  });
};

export const inviteUser = async (email: string, role: "employee" | "hr" | "admin") => {
  return {
    email,
    role,
    invitedAt: new Date().toISOString(),
  };
};

export const setUserRole = async (data: {
  uid: string;
  email?: string;
  displayName?: string;
  role: "employee" | "hr" | "admin";
}) => {
  const ref = firestore.collection("users").doc(data.uid);
  const doc = await ref.get();

  const userData: Record<string, unknown> = {
    role: data.role,
    updatedAt: new Date(),
  };

  if (data.email) userData.email = data.email;
  if (data.displayName) userData.displayName = data.displayName;

  if (!doc.exists) {
    // New user — create doc
    await ref.set({
      ...userData,
      createdAt: new Date(),
      status: "pending",
      team: "",
      joinDate: new Date().toISOString().split("T")[0],
    });
  } else {
    await ref.update(userData);
  }

  const updated = await ref.get();
  return { id: updated.id, ...updated.data() };
};
