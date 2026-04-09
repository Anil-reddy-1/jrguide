import { useState } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { Modal } from "../../components/common/Modal";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Plus, Copy, Trash2, ListChecks, Calendar } from "lucide-react";
import toast from "react-hot-toast";

// These are static template definitions — they define the default task structure.
// In production these would come from Firestore 'onboardingTemplates' collection.
const DEFAULT_TEMPLATES = [
  {
    id: "tpl-engineering",
    name: "Engineering Onboarding",
    description: "Full onboarding checklist for engineering team members.",
    tasks: 8,
    updatedAt: "2026-04-01",
    active: true,
  },
  {
    id: "tpl-marketing",
    name: "Marketing Onboarding",
    description: "Onboarding flow for marketing team with brand training.",
    tasks: 6,
    updatedAt: "2026-03-20",
    active: true,
  },
  {
    id: "tpl-general",
    name: "General Onboarding",
    description: "Standard onboarding template for all departments.",
    tasks: 8,
    updatedAt: "2026-03-15",
    active: true,
  },
];

export const HrTemplatesPage = () => {
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const handleCreate = () => {
    if (!form.name) return toast.error("Name is required");
    const newTemplate = {
      id: `tpl-${Date.now()}`,
      name: form.name,
      description: form.description,
      tasks: 0,
      updatedAt: new Date().toISOString().split("T")[0],
      active: true,
    };
    setTemplates((prev) => [...prev, newTemplate]);
    setShowModal(false);
    setForm({ name: "", description: "" });
    toast.success("Template created");
  };

  const handleDuplicate = (tpl: any) => {
    const dup = { ...tpl, id: `tpl-${Date.now()}`, name: `${tpl.name} (Copy)` };
    setTemplates((prev) => [...prev, dup]);
    toast.success("Template duplicated");
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Template deleted");
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Task Templates"
        subtitle={`${templates.length} templates`}
        action={
          <button type="button" onClick={() => setShowModal(true)} className="flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-2 text-xs font-medium text-white hover:bg-navy-800">
            <Plus size={14} /> New Template
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl) => (
          <div key={tpl.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                  <ListChecks size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{tpl.name}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar size={9} /> {tpl.updatedAt}</p>
                </div>
              </div>
              <StatusBadge variant={tpl.active ? "completed" : "pending"} label={tpl.active ? "Active" : "Draft"} />
            </div>
            <p className="text-xs text-slate-500 mb-3">{tpl.description}</p>
            <p className="text-xs text-slate-400 mb-3">{tpl.tasks} tasks</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => handleDuplicate(tpl)} className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-slate-200 py-1.5 text-xs text-slate-600 hover:bg-slate-50">
                <Copy size={12} /> Duplicate
              </button>
              <button type="button" onClick={() => handleDelete(tpl.id)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-red-500 hover:bg-red-50">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Template">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none" />
          </div>
          <button type="button" onClick={handleCreate} className="w-full rounded-lg bg-navy-900 py-2.5 text-sm font-semibold text-white hover:bg-navy-800">Create Template</button>
        </div>
      </Modal>
    </div>
  );
};
