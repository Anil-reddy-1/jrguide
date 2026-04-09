import { Router } from "express";
import { z } from "zod";
import { roleAuth } from "../middleware/roleAuth.js";
import { validateBody } from "../middleware/validate.js";
import { getEmployeeTasks, markTaskComplete, markTaskStarted } from "../services/onboarding.service.js";
import { sendSuccess } from "../utils/response.js";

const onboardingRouter = Router();

const completeSchema = z.object({
  taskId: z.string().min(1),
});

onboardingRouter.get("/tasks/:employeeId", roleAuth("employee", "hr", "admin"), async (req, res) => {
  const employeeId = String(req.params.employeeId);
  const tasks = await getEmployeeTasks(employeeId);
  return sendSuccess(res, tasks);
});

onboardingRouter.patch(
  "/tasks/:taskId/complete",
  roleAuth("employee", "hr", "admin"),
  async (req, res) => {
    const taskId = String(req.params.taskId);
    const result = await markTaskComplete(taskId);
    return sendSuccess(res, result);
  },
);

onboardingRouter.patch(
  "/tasks/:taskId/start",
  roleAuth("employee", "hr", "admin"),
  async (req, res) => {
    const taskId = String(req.params.taskId);
    const result = await markTaskStarted(taskId);
    return sendSuccess(res, result);
  },
);

export default onboardingRouter;
