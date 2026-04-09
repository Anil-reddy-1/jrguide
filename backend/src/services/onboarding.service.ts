import { firestore } from "../config/firebase.js";

export const getEmployeeTasks = async (employeeId: string) => {
  const snapshot = await firestore
    .collection("employeeTasks")
    .where("employeeId", "==", employeeId)
    .orderBy("dueDate", "asc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
