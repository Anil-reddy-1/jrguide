import { firestore } from "../config/firebase.js";

export const getEmployeeById = async (id: string) => {
  const doc = await firestore.collection("users").doc(id).get();
  if (!doc.exists) {
    return null;
  }

  return { id: doc.id, ...doc.data() };
};

export const listAllEmployees = async () => {
  const snapshot = await firestore.collection("users").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateEmployee = async (id: string, patch: Record<string, unknown>) => {
  await firestore.collection("users").doc(id).set({ ...patch, updatedAt: new Date() }, { merge: true });
  const updated = await getEmployeeById(id);
  return updated;
};
