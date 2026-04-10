import { useCallback } from "react";
import { useAuth } from "../../state/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../config/api";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Skeleton } from "../../components/common/Skeleton";
import { Upload, FileText, Shield, Eye, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

export const EmployeeDocumentsPage = () => {
  const { user } = useAuth();
  const uid = user?.uid ?? "";
  const queryClient = useQueryClient();

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["documents", uid],
    queryFn: () => apiClient<any[]>(`/api/documents/${uid}`),
    enabled: !!uid,
    retry: 2,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiClient("/api/documents/upload", { method: "POST", formData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", uid] });
      toast.success("Document uploaded successfully!");
    },
    onError: () => toast.error("Upload failed. Please try again."),
  });

  const handleUpload = useCallback((docType: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.png,.jpg,.jpeg";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) uploadMutation.mutate(file);
    };
    input.click();
  }, [uploadMutation]);

  const uploaded = docs.filter((d: any) => d.status !== "required").length;
  const verified = docs.filter((d: any) => d.status === "verified").length;
  const pending = docs.filter((d: any) => d.status === "required").length;

  if (isLoading) {
    return <div className="space-y-4"><Skeleton variant="card" /><Skeleton variant="row" count={5} /></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Documents" subtitle="Upload required files and track their review status." />

      {/* Summary */}
      <div className="flex flex-wrap gap-4">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Uploaded</p>
          <p className="text-xl font-bold text-slate-800">{uploaded}/{docs.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Verified</p>
          <p className="text-xl font-bold text-emerald-600">{verified}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pending</p>
          <p className="text-xl font-bold text-amber-600">{pending}</p>
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {docs.map((doc: any) => (
          <div
            key={doc.id}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
          >
            <div className={clsx(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              doc.status === "verified" ? "bg-emerald-50 text-emerald-500" :
              doc.status === "required" ? "bg-slate-100 text-slate-400" :
              "bg-blue-50 text-blue-500",
            )}>
              {doc.status === "verified" ? <CheckCircle size={18} /> : doc.status === "required" ? <Upload size={18} /> : <FileText size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">{doc.type}</p>
              {doc.fileName && <p className="text-xs text-slate-400 flex items-center gap-1"><FileText size={10} /> {doc.fileName}</p>}
            </div>
            <div className="flex items-center gap-2">
              {doc.required && <StatusBadge variant="required" label="Required" />}
              <StatusBadge
                variant={doc.status === "verified" ? "completed" : doc.status === "uploaded" ? "active" : doc.status === "rejected" ? "rejected" : "pending"}
                label={doc.status}
              />
              {doc.status === "required" && (
                <button
                  type="button"
                  onClick={() => handleUpload(doc.type)}
                  disabled={uploadMutation.isPending}
                  className="rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-navy-800 disabled:opacity-50"
                >
                  Upload
                </button>
              )}
            </div>
          </div>
        ))}
        {docs.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400">No documents required.</p>
        )}
      </div>
    </div>
  );
};
