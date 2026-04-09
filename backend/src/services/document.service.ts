import { randomUUID } from "node:crypto";
import { storage, firestore } from "../config/firebase.js";

export const uploadEmployeeDocument = async (employeeId: string, file: Express.Multer.File) => {
  const extension = file.originalname.split(".").pop() ?? "bin";
  const storagePath = `documents/${employeeId}/${randomUUID()}.${extension}`;
  const object = storage.file(storagePath);

  await object.save(file.buffer, {
    contentType: file.mimetype,
    resumable: false,
  });

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
