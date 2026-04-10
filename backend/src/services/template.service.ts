import { firestore } from "../config/firebase.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";

export type TemplateTaskInput = {
  title: string;
  description?: string;
  category?: string;
  dayOffset: number;
  priority?: "low" | "medium" | "high";
};

export type CreateTemplateInput = {
  name: string;
  description?: string;
  active?: boolean;
  tasks: TemplateTaskInput[];
};

export type UpdateTemplateInput = Partial<CreateTemplateInput>;

const addDays = (baseDate: Date, days: number) => {
  const result = new Date(baseDate);
  result.setDate(result.getDate() + days);
  return result;
};

const resolveStartDate = (startDate?: string, joinDate?: string) => {
  if (startDate) {
    return new Date(startDate);
  }

  if (joinDate) {
    return new Date(joinDate);
  }

  return new Date();
};

const templatesCollection = () => firestore.collection("onboardingTemplates");
const assignmentsCollection = () => firestore.collection("templateAssignments");
const tasksCollection = () => firestore.collection("employeeTasks");
const usersCollection = () => firestore.collection("users");

export const listTemplates = async (activeOnly = true) => {
  const query = activeOnly
    ? templatesCollection().where("active", "==", true).orderBy("updatedAt", "desc")
    : templatesCollection().orderBy("updatedAt", "desc");

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const createTemplate = async (data: CreateTemplateInput, actorUid: string) => {
  if (data.tasks.length === 0) {
    throw new ValidationError("Template must include at least one task");
  }

  const now = new Date();
  const ref = templatesCollection().doc();

  const payload = {
    name: data.name,
    description: data.description ?? "",
    active: data.active ?? true,
    tasks: data.tasks,
    createdBy: actorUid,
    createdAt: now,
    updatedAt: now,
  };

  await ref.set(payload);
  return { id: ref.id, ...payload };
};

export const updateTemplate = async (templateId: string, patch: UpdateTemplateInput) => {
  const ref = templatesCollection().doc(templateId);
  const doc = await ref.get();

  if (!doc.exists) {
    throw new NotFoundError("Template not found");
  }

  if (patch.tasks && patch.tasks.length === 0) {
    throw new ValidationError("Template must include at least one task");
  }

  const updatePayload: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (typeof patch.name === "string") updatePayload.name = patch.name;
  if (typeof patch.description === "string") updatePayload.description = patch.description;
  if (typeof patch.active === "boolean") updatePayload.active = patch.active;
  if (patch.tasks) updatePayload.tasks = patch.tasks;

  await ref.update(updatePayload);
  const updated = await ref.get();
  return { id: updated.id, ...updated.data() };
};

export const archiveTemplate = async (templateId: string) => {
  const ref = templatesCollection().doc(templateId);
  const doc = await ref.get();

  if (!doc.exists) {
    throw new NotFoundError("Template not found");
  }

  await ref.update({ active: false, updatedAt: new Date() });
  return { templateId, archived: true };
};

export const assignTemplateToEmployee = async (params: {
  employeeId: string;
  templateId: string;
  assignedBy: string;
  startDate?: string;
}) => {
  const employeeRef = usersCollection().doc(params.employeeId);
  const templateRef = templatesCollection().doc(params.templateId);
  const assignmentId = `${params.employeeId}_${params.templateId}`;
  const assignmentRef = assignmentsCollection().doc(assignmentId);

  const [employeeDoc, templateDoc, existingAssignmentDoc] = await Promise.all([
    employeeRef.get(),
    templateRef.get(),
    assignmentRef.get(),
  ]);

  if (!employeeDoc.exists) {
    throw new NotFoundError("Employee not found");
  }

  if (!templateDoc.exists) {
    throw new NotFoundError("Template not found");
  }

  if (existingAssignmentDoc.exists) {
    throw new ValidationError("This template is already assigned to this employee");
  }

  const employeeData = employeeDoc.data() as { joinDate?: string; role?: string };
  if (employeeData.role && employeeData.role !== "employee") {
    throw new ValidationError("Template can only be assigned to employees");
  }

  const templateData = templateDoc.data() as {
    active?: boolean;
    tasks?: TemplateTaskInput[];
    name?: string;
  };

  if (!templateData.active) {
    throw new ValidationError("Template is not active");
  }

  const templateTasks = templateData.tasks ?? [];
  if (templateTasks.length === 0) {
    throw new ValidationError("Template has no tasks to assign");
  }

  const baseDate = resolveStartDate(params.startDate, employeeData.joinDate);
  const now = new Date();
  const batch = firestore.batch();
  const generatedTaskIds: string[] = [];

  templateTasks.forEach((task) => {
    const taskRef = tasksCollection().doc();
    const dueDate = addDays(baseDate, task.dayOffset);
    const dayLabel = task.dayOffset === 0 ? "Day 1" : `Day ${task.dayOffset + 1}`;

    generatedTaskIds.push(taskRef.id);

    batch.set(taskRef, {
      employeeId: params.employeeId,
      title: task.title,
      description: task.description ?? "",
      category: task.category ?? "General",
      status: "pending",
      dueDate,
      dayLabel,
      priority: task.priority ?? "medium",
      templateId: params.templateId,
      templateAssignmentId: assignmentId,
      generatedAt: now,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  });

  batch.set(assignmentRef, {
    employeeId: params.employeeId,
    templateId: params.templateId,
    templateName: templateData.name ?? "",
    generatedTaskIds,
    generatedCount: generatedTaskIds.length,
    assignedBy: params.assignedBy,
    assignedAt: now,
    status: "generated",
    startDate: baseDate,
  });

  await batch.commit();

  return {
    assignmentId,
    employeeId: params.employeeId,
    templateId: params.templateId,
    generatedTaskIds,
    generatedCount: generatedTaskIds.length,
    assignedAt: now,
    status: "generated",
  };
};
