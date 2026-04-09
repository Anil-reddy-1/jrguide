import { firestore } from "../config/firebase.js";

export const listFaqs = async () => {
  const snapshot = await firestore.collection("faqs").where("active", "==", true).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const searchFaqs = async (query: string) => {
  const all = await listFaqs();
  const normalized = query.toLowerCase();
  return all.filter((faq) => {
    const question = String((faq as Record<string, unknown>).question ?? "").toLowerCase();
    const answer = String((faq as Record<string, unknown>).answer ?? "").toLowerCase();
    return question.includes(normalized) || answer.includes(normalized);
  });
};

export const createFaq = async (data: { question: string; answer: string; category: string }) => {
  const faq = {
    ...data,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const created = await firestore.collection("faqs").add(faq);
  return { id: created.id, ...faq };
};

export const updateFaq = async (id: string, patch: Partial<{ question: string; answer: string; category: string }>) => {
  const ref = firestore.collection("faqs").doc(id);
  await ref.update({ ...patch, updatedAt: new Date() });
  const updated = await ref.get();
  return { id: updated.id, ...updated.data() };
};

export const toggleFaqActive = async (id: string) => {
  const ref = firestore.collection("faqs").doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw new Error("FAQ not found");
  }
  const currentActive = doc.data()?.active ?? true;
  await ref.update({ active: !currentActive, updatedAt: new Date() });
  return { id, active: !currentActive };
};
