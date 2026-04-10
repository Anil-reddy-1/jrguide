import { Router } from "express";
import { z } from "zod";
import { roleAuth } from "../middleware/roleAuth.js";
import { getDashboardSummary, getRecentActivity } from "../services/report.service.js";
import { validateBody } from "../middleware/validate.js";
import {
  archiveTemplate,
  assignTemplateToEmployee,
  createTemplate,
  listTemplates,
  updateTemplate,
} from "../services/template.service.js";
import { sendSuccess } from "../utils/response.js";

const adminRouter = Router();

const templateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  dayOffset: z.coerce.number().int().min(0),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  active: z.boolean().optional(),
  tasks: z.array(templateTaskSchema).min(1),
});

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  active: z.boolean().optional(),
  tasks: z.array(templateTaskSchema).min(1).optional(),
});

const assignTemplateSchema = z.object({
  templateId: z.string().min(1),
  startDate: z.string().optional(),
});

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

adminRouter.get("/templates", roleAuth("hr", "admin"), async (req, res) => {
  const activeOnly = req.query.active !== "false";
  const templates = await listTemplates(activeOnly);
  return sendSuccess(res, templates);
});

adminRouter.post("/templates", roleAuth("hr", "admin"), validateBody(createTemplateSchema), async (req, res) => {
  const template = await createTemplate(req.body, req.user!.uid);
  return sendSuccess(res, template, 201);
});

adminRouter.patch("/templates/:templateId", roleAuth("hr", "admin"), validateBody(updateTemplateSchema), async (req, res) => {
  const templateId = String(req.params.templateId);
  const template = await updateTemplate(templateId, req.body);
  return sendSuccess(res, template);
});

adminRouter.delete("/templates/:templateId", roleAuth("hr", "admin"), async (req, res) => {
  const templateId = String(req.params.templateId);
  const result = await archiveTemplate(templateId);
  return sendSuccess(res, result);
});

adminRouter.post(
  "/employees/:employeeId/assign-template",
  roleAuth("hr", "admin"),
  validateBody(assignTemplateSchema),
  async (req, res) => {
    const employeeId = String(req.params.employeeId);
    const result = await assignTemplateToEmployee({
      employeeId,
      templateId: req.body.templateId,
      assignedBy: req.user!.uid,
      startDate: req.body.startDate,
    });

    return sendSuccess(res, result, 201);
  },
);

export default adminRouter;
