import { Router } from "express";
import { z } from "zod";
import { roleAuth } from "../middleware/roleAuth.js";
import { validateBody } from "../middleware/validate.js";
import { createAccessToken, inviteUser, setUserRole } from "../services/auth.service.js";
import { sendSuccess } from "../utils/response.js";

const authRouter = Router();

const loginSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["employee", "hr", "admin"]),
});

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["employee", "hr", "admin"]),
});

const setRoleSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email().optional(),
  displayName: z.string().optional(),
  role: z.enum(["employee", "hr", "admin"]),
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  const token = createAccessToken(req.body);
  return sendSuccess(res, { token });
});

authRouter.post("/invite", validateBody(inviteSchema), async (req, res) => {
  const invite = await inviteUser(req.body.email, req.body.role);
  return sendSuccess(res, invite, 201);
});

authRouter.post("/set-role", validateBody(setRoleSchema), async (req, res) => {
  const result = await setUserRole(req.body);
  return sendSuccess(res, result);
});

authRouter.post("/logout", (_req, res) => {
  return sendSuccess(res, { loggedOut: true });
});

export default authRouter;
