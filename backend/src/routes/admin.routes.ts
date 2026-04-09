import { Router } from "express";
import { roleAuth } from "../middleware/roleAuth.js";
import { getDashboardSummary, getRecentActivity } from "../services/report.service.js";
import { sendSuccess } from "../utils/response.js";

const adminRouter = Router();

adminRouter.get("/dashboard", roleAuth("hr", "admin"), async (_req, res) => {
  try {
    const summary = await getDashboardSummary();
    return sendSuccess(res, summary);
  } catch (error: any) {
    console.error("Dashboard fetch failed:", error.message);
    return sendSuccess(res, {
      totalEmployees: 0, completedTasks: 0, totalTasks: 0,
      pendingDocuments: 0, overdueTasks: 0, remindersSent: 0,
      blockedEmployees: 0, completionRate: 0,
    });
  }
});

adminRouter.get("/activity", roleAuth("hr", "admin"), async (_req, res) => {
  try {
    const activity = await getRecentActivity();
    return sendSuccess(res, activity);
  } catch (error: any) {
    console.error("Activity fetch failed:", error.message);
    return sendSuccess(res, []);
  }
});

adminRouter.get("/reports", roleAuth("hr", "admin"), async (_req, res) => {
  try {
    const summary = await getDashboardSummary();
    return sendSuccess(res, {
      completionTrends: [],
      bottlenecks: [],
      summary,
    });
  } catch {
    return sendSuccess(res, { completionTrends: [], bottlenecks: [], summary: {} });
  }
});

adminRouter.get("/audit-logs", roleAuth("hr", "admin"), async (_req, res) => {
  return sendSuccess(res, []);
});

export default adminRouter;
