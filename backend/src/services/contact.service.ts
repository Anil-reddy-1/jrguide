import { firestore } from "../config/firebase.js";

export const listContacts = async () => {
  const snapshot = await firestore.collection("contacts").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
