import { Router } from "express";
import { roleAuth } from "../middleware/roleAuth.js";
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notification.service.js";
import { sendSuccess } from "../utils/response.js";

const notificationRouter = Router();

notificationRouter.get(
  "/:userId",
  roleAuth("employee", "hr", "admin"),
  async (req, res) => {
    const userId = String(req.params.userId);
    const notifications = await getUserNotifications(userId);
    return sendSuccess(res, notifications);
  },
);

notificationRouter.patch(
  "/:id/read",
  roleAuth("employee", "hr", "admin"),
  async (req, res) => {
    const notifId = String(req.params.id);
    const result = await markNotificationRead(notifId);
    return sendSuccess(res, result);
  },
);

notificationRouter.patch(
  "/read-all/:userId",
  roleAuth("employee", "hr", "admin"),
  async (req, res) => {
    const userId = String(req.params.userId);
    const result = await markAllNotificationsRead(userId);
    return sendSuccess(res, result);
  },
);

export default notificationRouter;
