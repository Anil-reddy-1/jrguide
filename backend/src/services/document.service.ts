import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { storage, firestore, storageBucketName } from "../config/firebase.js";
import { AppError } from "../utils/errors.js";

const isBucketNotFoundError = (error: unknown) => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as { code?: unknown; message?: unknown };
  const message = typeof candidate.message === "string" ? candidate.message : "";
  return candidate.code === 404 || message.toLowerCase().includes("bucket does not exist");
};

const isBillingDisabledError = (error: unknown) => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as { message?: unknown };
  const message = typeof candidate.message === "string" ? candidate.message : "";
  return message.toLowerCase().includes("billing account") && message.toLowerCase().includes("disabled");
};

export const uploadEmployeeDocument = async (employeeId: string, file: Express.Multer.File) => {
  const extension = file.originalname.split(".").pop() ?? "bin";
  const storagePath = `documents/${employeeId}/${randomUUID()}.${extension}`;
  const object = storage.file(storagePath);

  try {
    await object.save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
    });
  } catch (error) {
    if (isBucketNotFoundError(error)) {
      throw new AppError(
        "Firebase Storage bucket is not found. Verify FIREBASE_STORAGE_BUCKET and ensure the bucket exists in your Firebase project.",
        500,
        {
          configuredBucket: storageBucketName,
          projectId: env.FIREBASE_PROJECT_ID,
          hint: `Try ${env.FIREBASE_PROJECT_ID}.appspot.com if you are using the default Firebase bucket.`,
        },
      );
    }

    if (isBillingDisabledError(error)) {
      throw new AppError(
        "Firebase Storage is unavailable because project billing is disabled.",
        500,
        {
          projectId: env.FIREBASE_PROJECT_ID,
          hint: "Enable billing for the Firebase/GCP project, then create a Storage bucket in Firebase Console and set FIREBASE_STORAGE_BUCKET to that exact bucket name.",
        },
      );
    }

    throw error;
  }

  const doc = {
    employeeId,
    type: "other",
    fileName: file.originalname,
    filePath: storagePath,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    status: "uploaded",
    uploadedAt: new Date(),
    updatedAt: new Date(),
  };

  const created = await firestore.collection("documents").add(doc);
  return { id: created.id, ...doc };
};

export const getEmployeeDocuments = async (employeeId: string) => {
  const snapshot = await firestore
    .collection("documents")
    .where("employeeId", "==", employeeId)
    .orderBy("uploadedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateDocumentStatus = async (docId: string, status: "verified" | "rejected", note?: string) => {
  const ref = firestore.collection("documents").doc(docId);
  const updateData: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };
  if (note) {
    updateData.note = note;
  }
  await ref.update(updateData);
  return { id: docId, status, note };
};
