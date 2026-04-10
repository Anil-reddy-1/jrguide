import { beforeEach, describe, expect, it, vi } from "vitest";

const makeDoc = (id: string, exists: boolean, data: Record<string, unknown> = {}) => ({
  id,
  exists,
  data: () => data,
});

const {
  batchSet,
  batchCommit,
  batch,
  templateDocGet,
  employeeDocGet,
  assignmentDocGet,
  templateDocUpdate,
  templateDocSet,
  firestoreMock,
  resetTaskSequence,
} = vi.hoisted(() => {
  const localBatchSet = vi.fn();
  const localBatchCommit = vi.fn();
  const localBatch = {
    set: localBatchSet,
    commit: localBatchCommit,
  };

  const localTemplateDocGet = vi.fn();
  const localEmployeeDocGet = vi.fn();
  const localAssignmentDocGet = vi.fn();
  const localTemplateDocUpdate = vi.fn();
  const localTemplateDocSet = vi.fn();

  let taskSequence = 0;
  const reset = () => {
    taskSequence = 0;
  };

  const localFirestoreMock = {
    collection: vi.fn((name: string) => {
      if (name === "onboardingTemplates") {
        return {
          doc: vi.fn((id?: string) => {
            if (id) {
              return {
                id,
                get: localTemplateDocGet,
                update: localTemplateDocUpdate,
                set: localTemplateDocSet,
              };
            }

            const generatedId = `tpl-${Date.now()}`;
            return {
              id: generatedId,
              set: localTemplateDocSet,
            };
          }),
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              get: vi.fn().mockResolvedValue({ docs: [] }),
            })),
          })),
          orderBy: vi.fn(() => ({
            get: vi.fn().mockResolvedValue({ docs: [] }),
          })),
        };
      }

      if (name === "users") {
        return {
          doc: vi.fn(() => ({
            get: localEmployeeDocGet,
          })),
        };
      }

      if (name === "templateAssignments") {
        return {
          doc: vi.fn(() => ({
            get: localAssignmentDocGet,
          })),
        };
      }

      if (name === "employeeTasks") {
        return {
          doc: vi.fn(() => {
            taskSequence += 1;
            return { id: `task-${taskSequence}` };
          }),
        };
      }

      throw new Error(`Unexpected collection: ${name}`);
    }),
    batch: vi.fn(() => localBatch),
  };

  return {
    batchSet: localBatchSet,
    batchCommit: localBatchCommit,
    batch: localBatch,
    templateDocGet: localTemplateDocGet,
    employeeDocGet: localEmployeeDocGet,
    assignmentDocGet: localAssignmentDocGet,
    templateDocUpdate: localTemplateDocUpdate,
    templateDocSet: localTemplateDocSet,
    firestoreMock: localFirestoreMock,
    resetTaskSequence: reset,
  };
});

vi.mock("../../src/config/firebase.js", () => ({
  firestore: firestoreMock,
}));

import {
  assignTemplateToEmployee,
  createTemplate,
  updateTemplate,
} from "../../src/services/template.service.js";
import { NotFoundError, ValidationError } from "../../src/utils/errors.js";

describe("template.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetTaskSequence();
    batchCommit.mockResolvedValue(undefined);
  });

  it("creates a template", async () => {
    const result = await createTemplate(
      {
        name: "General Onboarding",
        description: "Base template",
        tasks: [{ title: "Set up profile", dayOffset: 0 }],
      },
      "hr-001",
    );

    expect(result.name).toBe("General Onboarding");
    expect(templateDocSet).toHaveBeenCalledTimes(1);
  });

  it("updates an existing template", async () => {
    templateDocGet.mockResolvedValueOnce(makeDoc("tpl-1", true, { name: "Old", tasks: [{ title: "A", dayOffset: 0 }] }));
    templateDocGet.mockResolvedValueOnce(makeDoc("tpl-1", true, { name: "Updated", tasks: [{ title: "A", dayOffset: 0 }] }));

    const updated = await updateTemplate("tpl-1", { name: "Updated" });

    expect(updated.name).toBe("Updated");
    expect(templateDocUpdate).toHaveBeenCalledTimes(1);
  });

  it("throws when assigning missing template", async () => {
    employeeDocGet.mockResolvedValueOnce(makeDoc("emp-1", true, { role: "employee", joinDate: "2026-04-01" }));
    templateDocGet.mockResolvedValueOnce(makeDoc("tpl-1", false));
    assignmentDocGet.mockResolvedValueOnce(makeDoc("emp-1_tpl-1", false));

    await expect(
      assignTemplateToEmployee({
        employeeId: "emp-1",
        templateId: "tpl-1",
        assignedBy: "hr-1",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws on duplicate assignment", async () => {
    employeeDocGet.mockResolvedValueOnce(makeDoc("emp-1", true, { role: "employee", joinDate: "2026-04-01" }));
    templateDocGet.mockResolvedValueOnce(makeDoc("tpl-1", true, {
      active: true,
      name: "General",
      tasks: [{ title: "Set up account", dayOffset: 0 }],
    }));
    assignmentDocGet.mockResolvedValueOnce(makeDoc("emp-1_tpl-1", true, { status: "generated" }));

    await expect(
      assignTemplateToEmployee({
        employeeId: "emp-1",
        templateId: "tpl-1",
        assignedBy: "hr-1",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("generates employee tasks from template assignment", async () => {
    employeeDocGet.mockResolvedValueOnce(makeDoc("emp-1", true, { role: "employee", joinDate: "2026-04-01" }));
    templateDocGet.mockResolvedValueOnce(makeDoc("tpl-1", true, {
      active: true,
      name: "Engineering Onboarding",
      tasks: [
        { title: "Set up account", dayOffset: 0, category: "Setup" },
        { title: "Read policies", dayOffset: 1, category: "Orientation" },
      ],
    }));
    assignmentDocGet.mockResolvedValueOnce(makeDoc("emp-1_tpl-1", false));

    const result = await assignTemplateToEmployee({
      employeeId: "emp-1",
      templateId: "tpl-1",
      assignedBy: "hr-1",
      startDate: "2026-04-10",
    });

    expect(result.generatedCount).toBe(2);
    expect(result.generatedTaskIds).toEqual(["task-1", "task-2"]);
    expect(batchSet).toHaveBeenCalledTimes(3);
    expect(batchCommit).toHaveBeenCalledTimes(1);
  });
});
