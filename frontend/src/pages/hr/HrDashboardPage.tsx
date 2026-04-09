import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../config/api";
import { PageHeader } from "../../components/common/PageHeader";
import { StatCard } from "../../components/common/StatCard";
import { Skeleton } from "../../components/common/Skeleton";
import { Link } from "react-router-dom";
import { Users, CheckSquare, FileText, AlertTriangle, TrendingUp, Clock, ArrowRight } from "lucide-react";

export const HrDashboardPage = () => {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["hr-dashboard"],
    queryFn: () => apiClient<any>("/api/admin/dashboard"),
    retry: 2,
  });

  const { data: activity = [] } = useQuery({
    queryKey: ["hr-activity"],
    queryFn: () => apiClient<any[]>("/api/admin/activity"),
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Skeleton variant="card" /><Skeleton variant="card" /><Skeleton variant="card" /></div>
      </div>
    );
  }

  const s = summary ?? {};

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="HR Dashboard" subtitle="Overview of onboarding progress across all employees." />

      {/* Stats */}
      <div className="stagger-children grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Employees" value={String(s.totalEmployees ?? 0)} icon={<Users size={18} />} />
        <StatCard label="Completion Rate" value={`${s.completionRate ?? 0}%`} icon={<TrendingUp size={18} />} trend={s.completionRate >= 50 ? "up" : "down"} />
        <StatCard label="Tasks Completed" value={`${s.completedTasks ?? 0}/${s.totalTasks ?? 0}`} icon={<CheckSquare size={18} />} />
        <StatCard label="Pending Documents" value={String(s.pendingDocuments ?? 0)} icon={<FileText size={18} />} />
        <StatCard label="Overdue Tasks" value={String(s.overdueTasks ?? 0)} icon={<AlertTriangle size={18} />} />
        <StatCard label="Reminders Sent" value={String(s.remindersSent ?? 0)} icon={<Clock size={18} />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Activity Feed */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
          </div>
          {activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {activity.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${item.type === "task_completed" ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"}`}>
                    {item.type === "task_completed" ? <CheckSquare size={14} /> : <FileText size={14} />}
                  </div>
                  <p className="flex-1 text-sm text-slate-600">{item.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { to: "/hr/employees", label: "Manage Employees", icon: <Users size={16} /> },
              { to: "/hr/templates", label: "Task Templates", icon: <CheckSquare size={16} /> },
              { to: "/hr/faqs", label: "FAQ Manager", icon: <FileText size={16} /> },
              { to: "/hr/email", label: "Send Emails", icon: <Clock size={16} /> },
              { to: "/hr/analytics", label: "View Analytics", icon: <TrendingUp size={16} /> },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 text-sm text-slate-700 transition-all hover:bg-navy-50/30 hover:border-navy-200"
              >
                <span className="text-slate-400">{a.icon}</span>
                <span className="flex-1 font-medium">{a.label}</span>
                <ArrowRight size={14} className="text-slate-300" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
