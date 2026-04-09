import { Router } from "express";
import { roleAuth } from "../middleware/roleAuth.js";
import { getEmployeeById, updateEmployee, listAllEmployees } from "../services/employee.service.js";
import { sendSuccess } from "../utils/response.js";

const employeeRouter = Router();

employeeRouter.get("/", roleAuth("hr", "admin"), async (_req, res) => {
  const employees = await listAllEmployees();
  return sendSuccess(res, employees);
});

employeeRouter.get("/me", roleAuth("employee", "hr", "admin"), async (req, res) => {
  const me = await getEmployeeById(req.user!.uid);
  return sendSuccess(res, me);
});

employeeRouter.get("/:id", roleAuth("hr", "admin"), async (req, res) => {
  const employeeId = String(req.params.id);
  const employee = await getEmployeeById(employeeId);
  return sendSuccess(res, employee);
});

employeeRouter.patch("/:id", roleAuth("employee", "hr", "admin"), async (req, res) => {
  const employeeId = String(req.params.id);
  const employee = await updateEmployee(employeeId, req.body);
  return sendSuccess(res, employee);
});

export default employeeRouter;
