import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../config/api";
import { PageHeader } from "../../components/common/PageHeader";
import { StatCard } from "../../components/common/StatCard";
import { Skeleton } from "../../components/common/Skeleton";
import {
  TrendingUp,
  Users,
  CheckSquare,
  AlertTriangle,
  FileText,
} from "lucide-react";

export const HrAnalyticsPage = () => {
  const { data: report, isLoading } = useQuery({
    queryKey: ["hr-reports"],
    queryFn: () => apiClient<any>("/api/admin/reports"),
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </div>
    );
  }

  const s = report?.summary ?? {};
  const completionRate = s.completionRate ?? 0;
  const totalTasks = s.totalTasks ?? 0;
  const completedTasks = s.completedTasks ?? 0;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Track onboarding performance and identify bottlenecks."
      />

      {/* KPIs */}
      <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Completion Rate"
          value={`${completionRate}%`}
          icon={<TrendingUp size={18} />}
          trend={completionRate >= 50 ? "up" : "down"}
        />
        <StatCard
          label="Total Tasks"
          value={String(totalTasks)}
          icon={<CheckSquare size={18} />}
        />
        <StatCard
          label="Completed"
          value={String(completedTasks)}
          icon={<CheckSquare size={18} />}
        />
        <StatCard
          label="Overdue"
          value={String(s.overdueTasks ?? 0)}
          icon={<AlertTriangle size={18} />}
        />
      </div>

      {/* Completion Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          Task Completion Overview
        </h3>
        <div className="flex items-end gap-3 h-40">
          {[
            {
              label: "Completed",
              value: completedTasks,
              color: "bg-emerald-400",
            },
            {
              label: "In Progress",
              value: totalTasks - completedTasks - (s.overdueTasks ?? 0),
              color: "bg-blue-400",
            },
            {
              label: "Overdue",
              value: s.overdueTasks ?? 0,
              color: "bg-red-400",
            },
            {
              label: "Pending Docs",
              value: s.pendingDocuments ?? 0,
              color: "bg-amber-400",
            },
          ].map((bar) => {
            const maxVal = Math.max(totalTasks, 1);
            const pct = Math.max(5, (bar.value / maxVal) * 100);
            return (
              <div
                key={bar.label}
                className="flex flex-col items-center gap-1 flex-1"
              >
                <span className="text-xs font-semibold text-slate-600">
                  {bar.value}
                </span>
                <div
                  className={`w-full rounded-t-lg ${bar.color} transition-all`}
                  style={{ height: `${pct}%` }}
                />
                <span className="text-[10px] text-slate-500 text-center leading-tight">
                  {bar.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Users size={16} /> Employee Overview
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Employees</span>
              <span className="font-semibold text-slate-800">
                {s.totalEmployees ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Blocked Employees</span>
              <span className="font-semibold text-red-600">
                {s.blockedEmployees ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Reminders Sent</span>
              <span className="font-semibold text-slate-800">
                {s.remindersSent ?? 0}
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-900 flex items-center gap-2">
            <FileText size={16} /> Document Status
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Pending Documents</span>
              <span className="font-semibold text-amber-600">
                {s.pendingDocuments ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Completion Rate</span>
              <span className="font-semibold text-emerald-600">
                {completionRate}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
