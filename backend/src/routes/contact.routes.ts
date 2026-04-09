import { Router } from "express";
import { roleAuth } from "../middleware/roleAuth.js";
import { listContacts } from "../services/contact.service.js";
import { sendSuccess } from "../utils/response.js";

const contactRouter = Router();

contactRouter.get("/", roleAuth("employee", "hr", "admin"), async (_req, res) => {
  const contacts = await listContacts();
  return sendSuccess(res, contacts);
});

export default contactRouter;
