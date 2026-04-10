import { useState } from "react";
import { useAuth } from "../../state/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../config/api";
import { PageHeader } from "../../components/common/PageHeader";
import { ProgressBar } from "../../components/common/ProgressBar";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Skeleton } from "../../components/common/Skeleton";
import { CheckCircle, Circle, Clock, ChevronDown, ChevronUp, Calendar, Tag } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

export const EmployeeChecklistPage = () => {
  const { user } = useAuth();
  const uid = user?.uid ?? "";
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "completed">("all");

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", uid],
    queryFn: () => apiClient<any[]>(`/api/onboarding/tasks/${uid}`),
    enabled: !!uid,
    retry: 2,
  });

  const completeMutation = useMutation({
    mutationFn: (taskId: string) => apiClient(`/api/onboarding/tasks/${taskId}/complete`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", uid] });
      toast.success("Task completed! 🎉");
    },
    onError: () => toast.error("Failed to update task"),
  });

  const startMutation = useMutation({
    mutationFn: (taskId: string) => apiClient(`/api/onboarding/tasks/${taskId}/start`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", uid] });
      toast.success("Task started");
    },
    onError: () => toast.error("Failed to start task"),
  });

  const completed = tasks.filter((t: any) => t.status === "completed").length;
  const total = tasks.length || 1;
  const progress = Math.round((completed / total) * 100);

  const filtered = tasks.filter((t: any) => filter === "all" || t.status === filter);
  const counts = {
    all: tasks.length,
    pending: tasks.filter((t: any) => t.status === "pending").length,
    in_progress: tasks.filter((t: any) => t.status === "in_progress").length,
    completed: tasks.filter((t: any) => t.status === "completed").length,
  };

  const handleStatusClick = (task: any) => {
    if (task.status === "completed") return;
    if (task.status === "pending") startMutation.mutate(task.id);
    else if (task.status === "in_progress") completeMutation.mutate(task.id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="card" />
        <Skeleton variant="row" count={5} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="My Tasks" subtitle="Your onboarding checklist — complete each task to finish onboarding." />

      {/* Progress */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Onboarding Progress</h3>
            <p className="text-xs text-slate-500">{completed} of {tasks.length} tasks completed</p>
          </div>
        </div>
        <ProgressBar value={progress} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "in_progress", "completed"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={clsx(
              "rounded-lg px-3 py-2 text-xs font-medium transition-all",
              filter === f ? "bg-navy-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
            )}
          >
            {f === "all" ? "All" : f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}{" "}
            <span className="ml-1 opacity-70">{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filtered.map((task: any) => (
          <div
            key={task.id}
            className={clsx(
              "rounded-xl border bg-white p-4 shadow-sm transition-all",
              task.status === "completed" ? "border-slate-200 opacity-70" : "border-slate-200 hover:shadow-md",
            )}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleStatusClick(task)}
                disabled={task.status === "completed" || completeMutation.isPending || startMutation.isPending}
                className="shrink-0"
              >
                {task.status === "completed" ? (
                  <CheckCircle size={22} className="text-emerald-500" />
                ) : task.status === "in_progress" ? (
                  <Clock size={22} className="text-blue-500" />
                ) : (
                  <Circle size={22} className="text-slate-300 hover:text-slate-500" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={clsx("text-sm font-medium", task.status === "completed" ? "text-slate-400 line-through" : "text-slate-800")}>
                  {task.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Calendar size={11} /> {task.dayLabel ?? "—"}</span>
                  {task.category && <span className="flex items-center gap-1"><Tag size={11} /> {task.category}</span>}
                </div>
              </div>
              <StatusBadge
                variant={task.status === "completed" ? "completed" : task.status === "in_progress" ? "in_progress" : "pending"}
                label={task.status === "in_progress" ? undefined : task.status}
              />
              <button type="button" onClick={() => setExpandedId(expandedId === task.id ? null : task.id)} className="p-1 text-slate-400 hover:text-slate-600">
                {expandedId === task.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
            {expandedId === task.id && (
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                {task.description ?? "No additional details."}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">No tasks in this category.</p>
        )}
      </div>
    </div>
  );
};
