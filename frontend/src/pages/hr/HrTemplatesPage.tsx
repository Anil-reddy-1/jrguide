import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../config/api";
import { PageHeader } from "../../components/common/PageHeader";
import { Modal } from "../../components/common/Modal";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Plus, Copy, Trash2, ListChecks, Calendar, Send } from "lucide-react";
import toast from "react-hot-toast";

type TemplateTask = {
  title: string;
  description?: string;
  category?: string;
  dayOffset: number;
  priority?: "low" | "medium" | "high";
};

type Template = {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  tasks: TemplateTask[];
  updatedAt?: string;
};

type Employee = {
  id: string;
  displayName?: string;
  email?: string;
};

export const HrTemplatesPage = () => {
  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ["hr-templates"],
    queryFn: () => apiClient<Template[]>("/api/admin/templates?active=false"),
    retry: 2,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => apiClient<Employee[]>("/api/employees"),
    retry: 2,
  });

  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });
  const [taskRows, setTaskRows] = useState<TemplateTask[]>([
    {
      title: "",
      description: "",
      category: "General",
      dayOffset: 0,
      priority: "medium",
    },
  ]);

  const selectedTemplate = useMemo(
    () => templates.find((tpl) => tpl.id === selectedTemplateId),
    [templates, selectedTemplateId],
  );

  const createMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      description: string;
      tasks: TemplateTask[];
    }) =>
      apiClient<Template>("/api/admin/templates", {
        method: "POST",
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-templates"] });
      toast.success("Template created");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Failed to create template",
      ),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      templateId,
      payload,
    }: {
      templateId: string;
      payload: Partial<Template>;
    }) =>
      apiClient<Template>(`/api/admin/templates/${templateId}`, {
        method: "PATCH",
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-templates"] });
      toast.success("Template updated");
    },
    onError: () => toast.error("Failed to update template"),
  });

  const archiveMutation = useMutation({
    mutationFn: (templateId: string) =>
      apiClient(`/api/admin/templates/${templateId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-templates"] });
      toast.success("Template archived");
    },
    onError: () => toast.error("Failed to archive template"),
  });

  const assignMutation = useMutation({
    mutationFn: ({
      employeeId,
      templateId,
    }: {
      employeeId: string;
      templateId: string;
    }) =>
      apiClient(`/api/admin/employees/${employeeId}/assign-template`, {
        method: "POST",
        body: { templateId },
      }),
    onSuccess: () => {
      toast.success("Template assigned successfully");
      setShowAssignModal(false);
      setSelectedEmployeeId("");
      setSelectedTemplateId("");
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Failed to assign template",
      ),
  });

  const handleCreate = () => {
    if (!form.name) return toast.error("Name is required");

    const validTasks = taskRows
      .map((task) => ({ ...task, title: task.title.trim() }))
      .filter((task) => task.title.length > 0);

    if (validTasks.length === 0) {
      return toast.error("Add at least one task");
    }

    createMutation.mutate({
      name: form.name,
      description: form.description,
      tasks: validTasks,
    });

    setShowModal(false);
    setForm({ name: "", description: "" });
    setTaskRows([
      {
        title: "",
        description: "",
        category: "General",
        dayOffset: 0,
        priority: "medium",
      },
    ]);
  };

  const handleDuplicate = (tpl: Template) => {
    createMutation.mutate({
      name: `${tpl.name} (Copy)`,
      description: tpl.description ?? "",
      tasks: tpl.tasks,
    });
  };

  const handleDelete = (id: string) => {
    archiveMutation.mutate(id);
  };

  const handleToggleActive = (tpl: Template) => {
    updateMutation.mutate({
      templateId: tpl.id,
      payload: { active: !tpl.active },
    });
  };

  const handleAssign = () => {
    if (!selectedTemplateId || !selectedEmployeeId) {
      return toast.error("Select a template and an employee");
    }

    assignMutation.mutate({
      templateId: selectedTemplateId,
      employeeId: selectedEmployeeId,
    });
  };

  const updateTaskRow = (index: number, patch: Partial<TemplateTask>) => {
    setTaskRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  const addTaskRow = () => {
    setTaskRows((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        category: "General",
        dayOffset: 0,
        priority: "medium",
      },
    ]);
  };

  const removeTaskRow = (index: number) => {
    setTaskRows((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Task Templates"
        subtitle={`${templates.length} templates`}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Send size={14} /> Assign
            </button>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-2 text-xs font-medium text-white hover:bg-navy-800"
            >
              <Plus size={14} /> New Template
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                  <ListChecks size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {tpl.name}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar size={9} />{" "}
                    {tpl.updatedAt
                      ? new Date(tpl.updatedAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>
              <StatusBadge
                variant={tpl.active ? "completed" : "pending"}
                label={tpl.active ? "Active" : "Draft"}
              />
            </div>
            <p className="text-xs text-slate-500 mb-3">{tpl.description}</p>
            <p className="text-xs text-slate-400 mb-3">
              {tpl.tasks?.length ?? 0} tasks
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDuplicate(tpl)}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-slate-200 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
              >
                <Copy size={12} /> Duplicate
              </button>
              <button
                type="button"
                onClick={() => handleToggleActive(tpl)}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
              >
                {tpl.active ? "Pause" : "Activate"}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(tpl.id)}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-red-500 hover:bg-red-50"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="New Template"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                Tasks
              </label>
              <button
                type="button"
                onClick={addTaskRow}
                className="text-xs font-medium text-navy-600 hover:text-navy-800"
              >
                + Add Task
              </button>
            </div>
            {taskRows.map((task, index) => (
              <div
                key={`${index}`}
                className="rounded-lg border border-slate-200 p-3 space-y-2"
              >
                <input
                  value={task.title}
                  onChange={(e) =>
                    updateTaskRow(index, { title: e.target.value })
                  }
                  placeholder="Task title"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    value={task.category ?? ""}
                    onChange={(e) =>
                      updateTaskRow(index, { category: e.target.value })
                    }
                    placeholder="Category"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    min={0}
                    value={task.dayOffset}
                    onChange={(e) =>
                      updateTaskRow(index, {
                        dayOffset: Number(e.target.value),
                      })
                    }
                    placeholder="Day offset"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                  />
                  <select
                    value={task.priority ?? "medium"}
                    onChange={(e) =>
                      updateTaskRow(index, {
                        priority: e.target.value as "low" | "medium" | "high",
                      })
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  value={task.description ?? ""}
                  onChange={(e) =>
                    updateTaskRow(index, { description: e.target.value })
                  }
                  placeholder="Task description"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                />
                {taskRows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTaskRow(index)}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="w-full rounded-lg bg-navy-900 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
          >
            Create Template
          </button>
        </div>
      </Modal>

      <Modal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Template"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Template
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
            >
              <option value="">Select template</option>
              {templates
                .filter((tpl) => tpl.active)
                .map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Employee
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
            >
              <option value="">Select employee</option>
              {employees
                .filter((emp) => !emp.id.startsWith("demo-hr"))
                .map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.displayName ?? emp.email ?? emp.id}
                  </option>
                ))}
            </select>
          </div>
          {selectedTemplate && (
            <p className="text-xs text-slate-500">
              This will generate {selectedTemplate.tasks?.length ?? 0} tasks
              from{" "}
              <span className="font-semibold">{selectedTemplate.name}</span>.
            </p>
          )}
          <button
            type="button"
            onClick={handleAssign}
            className="w-full rounded-lg bg-navy-900 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
          >
            Assign Template
          </button>
        </div>
      </Modal>
    </div>
  );
};
