import type { Server } from "socket.io";
import { firestore } from "../config/firebase.js";

export const createNotification = async (payload: {
  userId: string;
  type: string;
  title: string;
  message: string;
}) => {
  const notification = {
    ...payload,
    read: false,
    createdAt: new Date(),
  };
  const created = await firestore.collection("notifications").add(notification);
  return { id: created.id, ...notification };
};

export const getUserNotifications = async (userId: string) => {
  const snapshot = await firestore
    .collection("notifications")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const markNotificationRead = async (notifId: string) => {
  const ref = firestore.collection("notifications").doc(notifId);
  await ref.update({ read: true, readAt: new Date() });
  return { id: notifId, read: true };
};

export const markAllNotificationsRead = async (userId: string) => {
  const snapshot = await firestore
    .collection("notifications")
    .where("userId", "==", userId)
    .where("read", "==", false)
    .get();

  const batch = firestore.batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { read: true, readAt: new Date() });
  });
  await batch.commit();

  return { updatedCount: snapshot.size };
};

export const emitUserNotification = (io: Server, userId: string, event: string, payload: unknown) => {
  io.to(`user:${userId}`).emit(event, payload);
};
