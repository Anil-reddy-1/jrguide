import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../config/api";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Skeleton } from "../../components/common/Skeleton";
import { Modal } from "../../components/common/Modal";
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

export const HrFaqManagerPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editFaq, setEditFaq] = useState<any>(null);
  const [form, setForm] = useState({ question: "", answer: "", category: "" });

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: () => apiClient<any[]>("/api/faqs"),
    retry: 2,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient("/api/faqs", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      setShowModal(false);
      setForm({ question: "", answer: "", category: "" });
      toast.success("FAQ created");
    },
    onError: () => toast.error("Failed to create FAQ"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient(`/api/faqs/${id}`, { method: "PATCH", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      setShowModal(false);
      setEditFaq(null);
      toast.success("FAQ updated");
    },
    onError: () => toast.error("Failed to update FAQ"),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/api/faqs/${id}/toggle`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("FAQ status toggled");
    },
  });

  const handleSubmit = () => {
    if (!form.question || !form.answer) return toast.error("Question and Answer are required");
    if (editFaq) {
      updateMutation.mutate({ id: editFaq.id, data: form });
    } else {
      createMutation.mutate({ ...form, active: true });
    }
  };

  const openEdit = (faq: any) => {
    setEditFaq(faq);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category ?? "" });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditFaq(null);
    setForm({ question: "", answer: "", category: "" });
    setShowModal(true);
  };

  const filtered = faqs.filter((f: any) => !search || f.question.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) return <div className="space-y-4"><Skeleton variant="card" /><Skeleton variant="row" count={5} /></div>;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="FAQ Manager"
        subtitle={`${faqs.length} FAQs`}
        action={
          <button type="button" onClick={openCreate} className="flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-2 text-xs font-medium text-white hover:bg-navy-800">
            <Plus size={14} /> Add FAQ
          </button>
        }
      />

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search FAQs..." className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20" />
      </div>

      <div className="space-y-3">
        {filtered.map((faq: any) => (
          <div key={faq.id} className={clsx("rounded-xl border bg-white p-4 shadow-sm", !faq.active && "opacity-60")}>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{faq.question}</p>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{faq.answer}</p>
              </div>
              {faq.category && <StatusBadge variant="info" label={faq.category} />}
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => toggleMutation.mutate(faq.id)} className="p-1.5 text-slate-400 hover:text-slate-600" title={faq.active ? "Deactivate" : "Activate"}>
                  {faq.active ? <ToggleRight size={18} className="text-emerald-500" /> : <ToggleLeft size={18} />}
                </button>
                <button type="button" onClick={() => openEdit(faq)} className="p-1.5 text-slate-400 hover:text-slate-600"><Edit size={14} /></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="py-12 text-center text-sm text-slate-400">No FAQs found.</p>}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditFaq(null); }} title={editFaq ? "Edit FAQ" : "Create FAQ"}>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Question</label>
            <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Answer</label>
            <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none" />
          </div>
          <button type="button" onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} className="w-full rounded-lg bg-navy-900 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-50">
            {editFaq ? "Update FAQ" : "Create FAQ"}
          </button>
        </div>
      </Modal>
    </div>
  );
};
