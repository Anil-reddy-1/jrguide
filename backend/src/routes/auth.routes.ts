import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { roleAuth } from "../middleware/roleAuth.js";
import { validateBody } from "../middleware/validate.js";
import { createAccessToken, getStoredUserRole, inviteUser, setUserRole } from "../services/auth.service.js";
import { ForbiddenError } from "../utils/errors.js";
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

authRouter.post("/invite", authMiddleware, roleAuth("hr", "admin"), validateBody(inviteSchema), async (req, res) => {
  const invite = await inviteUser(req.body.email, req.body.role);
  return sendSuccess(res, invite, 201);
});

authRouter.post("/set-role", authMiddleware, validateBody(setRoleSchema), async (req, res) => {
  const actor = req.user!;
  const targetUid = req.body.uid;
  const isPrivilegedActor = actor.role === "hr" || actor.role === "admin";

  if (!isPrivilegedActor) {
    if (actor.uid !== targetUid) {
      throw new ForbiddenError("You can only set your own role");
    }

    const existingRole = await getStoredUserRole(targetUid);
    if (existingRole) {
      throw new ForbiddenError("Role is already assigned. Please contact HR to make changes.");
    }
  }

  const result = await setUserRole(req.body);
  return sendSuccess(res, result);
});

authRouter.post("/logout", (_req, res) => {
  return sendSuccess(res, { loggedOut: true });
});

export default authRouter;
