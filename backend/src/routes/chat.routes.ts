import { Router } from "express";
import { z } from "zod";
import { roleAuth } from "../middleware/roleAuth.js";
import { validateBody } from "../middleware/validate.js";
import { askOnboardingAssistant } from "../services/ai.service.js";
import { sendSuccess } from "../utils/response.js";

const chatRouter = Router();

const chatSchema = z.object({
  question: z.string().min(2).max(1000),
  context: z.string().default("No context provided."),
});

chatRouter.post("/query", roleAuth("employee", "hr", "admin"), validateBody(chatSchema), async (req, res) => {
  try {
    const result = await askOnboardingAssistant(req.body.question, req.body.context);
    return sendSuccess(res, result);
  } catch (error: any) {
    console.error("Chat query failed:", error.message);
    return sendSuccess(res, {
      answer: "I'm having trouble right now. Please try again later or contact HR at hr@company.com.",
      sources: [],
    });
  }
});

export default chatRouter;
