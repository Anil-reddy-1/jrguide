import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { env } from "./env.js";

const resolveFirebaseCredential = () => {
  if (env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccountPath = resolve(process.cwd(), env.FIREBASE_SERVICE_ACCOUNT_PATH);
    if (existsSync(serviceAccountPath)) {
      const payload = JSON.parse(readFileSync(serviceAccountPath, "utf8")) as ServiceAccount;
      return cert(payload);
    }
  }

  if (env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
    return cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }

  return applicationDefault();
};

const app = getApps()[0] ?? initializeApp({
  credential: resolveFirebaseCredential(),
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
});

export const firebaseAuth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app).bucket();
