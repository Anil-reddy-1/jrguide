import { Router } from "express";
import { roleAuth } from "../middleware/roleAuth.js";
import { upload } from "../middleware/upload.js";
import { uploadEmployeeDocument, getEmployeeDocuments, updateDocumentStatus } from "../services/document.service.js";
import { sendSuccess } from "../utils/response.js";
import { z } from "zod";
import { validateBody } from "../middleware/validate.js";

const documentRouter = Router();

documentRouter.get("/:employeeId", roleAuth("employee", "hr", "admin"), async (req, res) => {
  const employeeId = String(req.params.employeeId);
  const docs = await getEmployeeDocuments(employeeId);
  return sendSuccess(res, docs);
});

documentRouter.post(
  "/upload",
  roleAuth("employee", "hr", "admin"),
  upload.single("file"),
  async (req, res) => {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: { message: "File is required" } });
    }

    const result = await uploadEmployeeDocument(req.user!.uid, file);
    return sendSuccess(res, result, 201);
  },
);

const statusSchema = z.object({
  status: z.enum(["verified", "rejected"]),
  note: z.string().optional(),
});

documentRouter.patch(
  "/:docId/status",
  roleAuth("hr", "admin"),
  validateBody(statusSchema),
  async (req, res) => {
    const docId = String(req.params.docId);
    const result = await updateDocumentStatus(docId, req.body.status, req.body.note);
    return sendSuccess(res, result);
  },
);

export default documentRouter;
