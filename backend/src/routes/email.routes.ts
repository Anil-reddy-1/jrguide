import { Router } from "express";
import { z } from "zod";
import { roleAuth } from "../middleware/roleAuth.js";
import { validateBody } from "../middleware/validate.js";
import { sendTemplateEmail, sendTestEmail } from "../services/email.service.js";
import { sendSuccess } from "../utils/response.js";
import { env } from "../config/env.js";

const emailRouter = Router();

const testEmailSchema = z.object({
  to: z.string().email(),
});

const reminderSchema = z.object({
  to: z.string().email(),
  name: z.string().min(1),
  pendingCount: z.number().int().nonnegative(),
});

emailRouter.post("/test", roleAuth("hr", "admin"), validateBody(testEmailSchema), async (req, res) => {
  await sendTestEmail(req.body.to);
  return sendSuccess(res, { sent: true });
});

emailRouter.post(
  "/reminder",
  roleAuth("hr", "admin"),
  validateBody(reminderSchema),
  async (req, res) => {
    if (!env.BREVO_REMINDER_TEMPLATE_ID) {
      return res.status(400).json({ success: false, error: { message: "Missing Brevo reminder template id" } });
    }

    await sendTemplateEmail(req.body.to, env.BREVO_REMINDER_TEMPLATE_ID, {
      name: req.body.name,
      pendingCount: req.body.pendingCount,
    });

    return sendSuccess(res, { sent: true });
  },
);

export default emailRouter;
