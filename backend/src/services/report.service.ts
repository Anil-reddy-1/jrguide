import { firestore } from "../config/firebase.js";

export const getDashboardSummary = async () => {
  const [usersSnapshot, tasksSnapshot, docsSnapshot, notifsSnapshot] = await Promise.all([
    firestore.collection("users").get(),
    firestore.collection("employeeTasks").get(),
    firestore.collection("documents").get(),
    firestore.collection("notifications").get(),
  ]);

  const totalEmployees = usersSnapshot.docs.filter((d) => d.data().role === "employee").length;
  const completedTasks = tasksSnapshot.docs.filter((doc) => doc.data().status === "completed").length;
  const totalTasks = tasksSnapshot.size;
  const pendingDocuments = docsSnapshot.docs.filter((doc) => doc.data().status !== "verified").length;
  const overdueTasks = tasksSnapshot.docs.filter((doc) => {
    const data = doc.data();
    if (data.status === "completed") return false;
    const dueDate = data.dueDate?.toDate?.() ?? new Date(data.dueDate);
    return dueDate < new Date();
  }).length;

  const remindersSent = notifsSnapshot.docs.filter((doc) => doc.data().type === "reminder").length;

  const overdueEmployees = new Set(
    tasksSnapshot.docs
      .filter((doc) => {
        const data = doc.data();
        if (data.status === "completed") return false;
        const dueDate = data.dueDate?.toDate?.() ?? new Date(data.dueDate);
        return dueDate < new Date();
      })
      .map((doc) => doc.data().employeeId),
  );
  const blockedEmployees = overdueEmployees.size;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalEmployees,
    completedTasks,
    totalTasks,
    pendingDocuments,
    overdueTasks,
    remindersSent,
    blockedEmployees,
    completionRate,
  };
};

export const getRecentActivity = async () => {
  // Combine recent notifications + task completions + document uploads
  const [notifSnapshot, taskSnapshot, docSnapshot] = await Promise.all([
    firestore.collection("notifications").orderBy("createdAt", "desc").limit(10).get(),
    firestore.collection("employeeTasks").where("status", "==", "completed").orderBy("completedAt", "desc").limit(5).get(),
    firestore.collection("documents").where("status", "!=", "required").orderBy("status").limit(5).get(),
  ]);

  const activities: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: unknown;
    status?: string;
  }> = [];

  for (const doc of taskSnapshot.docs) {
    const data = doc.data();
    // look up user
    const userDoc = await firestore.collection("users").doc(data.employeeId).get();
    const userName = userDoc.data()?.displayName ?? "An employee";
    activities.push({
      id: doc.id,
      type: "task_completed",
      message: `${userName} completed "${data.title}"`,
      timestamp: data.completedAt,
      status: "completed",
    });
  }

  for (const doc of docSnapshot.docs) {
    const data = doc.data();
    const userDoc = await firestore.collection("users").doc(data.employeeId).get();
    const userName = userDoc.data()?.displayName ?? "An employee";
    activities.push({
      id: doc.id,
      type: "document_uploaded",
      message: `${userName} uploaded ${data.type ?? data.fileName ?? "a document"}`,
      timestamp: data.uploadedAt ?? data.createdAt,
      status: data.status,
    });
  }

  return activities;
};
