import { firestore } from "../config/firebase.js";

export const getEmployeeTasks = async (employeeId: string) => {
  const snapshot = await firestore
    .collection("employeeTasks")
    .where("employeeId", "==", employeeId)
    .get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() as any }))
    .sort((a, b) => {
      const dateA = a.dueDate?.toDate?.() || new Date(a.dueDate) || 0;
      const dateB = b.dueDate?.toDate?.() || new Date(b.dueDate) || 0;
      return dateA - dateB;
    });
};

export const markTaskComplete = async (taskId: string) => {
  const ref = firestore.collection("employeeTasks").doc(taskId);
  await ref.update({
    status: "completed",
    completedAt: new Date(),
    updatedAt: new Date(),
  });
  return { taskId, status: "completed" };
};

export const markTaskStarted = async (taskId: string) => {
  const ref = firestore.collection("employeeTasks").doc(taskId);
  await ref.update({
    status: "in_progress",
    updatedAt: new Date(),
  });
  return { taskId, status: "in_progress" };
};
