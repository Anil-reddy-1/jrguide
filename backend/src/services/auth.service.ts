import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { firebaseAuth, firestore } from "../config/firebase.js";
import { assignTemplateToEmployee, listTemplates } from "./template.service.js";

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

export const getStoredUserRole = async (uid: string): Promise<"employee" | "hr" | "admin" | undefined> => {
  const doc = await firestore.collection("users").doc(uid).get();
  if (!doc.exists) {
    return undefined;
  }

  const role = doc.data()?.role;
  if (role === "employee" || role === "hr" || role === "admin") {
    return role;
  }

  return undefined;
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

  // Keep Firebase custom claims in sync so ID tokens carry role-based authorization.
  await firebaseAuth.setCustomUserClaims(data.uid, { role: data.role });

  // If the user is an employee, automatically assign the first active onboarding template
  if (data.role === "employee") {
    try {
      const snapshot = await firestore.collection("onboardingTemplates")
        .where("active", "==", true)
        .get();
      
      const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (templates.length > 0) {
        // Use tpl-general if available, otherwise just use the first active one
        const defaultTemplate = templates.find(t => t.id === "tpl-general") || templates[0];
        
        await assignTemplateToEmployee({
          employeeId: data.uid,
          templateId: defaultTemplate.id,
          assignedBy: "system",
        }).catch(err => {
          // Ignore if already assigned (validation error)
          if (err.message && err.message.includes("already assigned")) return;
          console.error(`Failed to auto-assign template ${defaultTemplate.id} to user ${data.uid}:`, err.message);
        });
      }
    } catch (err: any) {
      console.error("Template auto-assignment failed:", err.message);
    }
  }

  const updated = await ref.get();
  return { id: updated.id, ...updated.data() };
};
