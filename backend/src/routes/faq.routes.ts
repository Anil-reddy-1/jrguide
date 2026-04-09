import { Router } from "express";
import { z } from "zod";
import { roleAuth } from "../middleware/roleAuth.js";
import { validateBody } from "../middleware/validate.js";
import { listFaqs, searchFaqs, createFaq, updateFaq, toggleFaqActive } from "../services/faq.service.js";
import { sendSuccess } from "../utils/response.js";

const faqRouter = Router();

faqRouter.get("/", roleAuth("employee", "hr", "admin"), async (_req, res) => {
  const faqs = await listFaqs();
  return sendSuccess(res, faqs);
});

faqRouter.get("/search", roleAuth("employee", "hr", "admin"), async (req, res) => {
  const query = String(req.query.q ?? "");
  const faqs = await searchFaqs(query);
  return sendSuccess(res, faqs);
});

const faqSchema = z.object({
  question: z.string().min(3),
  answer: z.string().min(3),
  category: z.string().min(1),
});

faqRouter.post("/", roleAuth("hr", "admin"), validateBody(faqSchema), async (req, res) => {
  const faq = await createFaq(req.body);
  return sendSuccess(res, faq, 201);
});

const updateFaqSchema = z.object({
  question: z.string().min(3).optional(),
  answer: z.string().min(3).optional(),
  category: z.string().min(1).optional(),
});

faqRouter.patch("/:id", roleAuth("hr", "admin"), validateBody(updateFaqSchema), async (req, res) => {
  const faqId = String(req.params.id);
  const updated = await updateFaq(faqId, req.body);
  return sendSuccess(res, updated);
});

faqRouter.patch("/:id/toggle", roleAuth("hr", "admin"), async (req, res) => {
  const faqId = String(req.params.id);
  const result = await toggleFaqActive(faqId);
  return sendSuccess(res, result);
});

export default faqRouter;
