import { useAuth } from "../../state/auth";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../config/api";
import { PageHeader } from "../../components/common/PageHeader";
import { ProgressCircle } from "../../components/common/ProgressCircle";
import { StatCard } from "../../components/common/StatCard";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Skeleton } from "../../components/common/Skeleton";
import { Link } from "react-router-dom";
import { CheckSquare, FileText, TrendingUp, Upload, HelpCircle, MessageSquare, ArrowRight } from "lucide-react";

export const EmployeeHomePage = () => {
  const { user } = useAuth();
  const uid = user?.uid ?? "";

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", uid],
    queryFn: () => apiClient<any[]>(`/api/onboarding/tasks/${uid}`),
    enabled: !!uid,
    retry: 2,
  });

  const { data: docs = [], isLoading: docsLoading } = useQuery({
    queryKey: ["documents", uid],
    queryFn: () => apiClient<any[]>(`/api/documents/${uid}`),
    enabled: !!uid,
    retry: 2,
  });

  const completedTasks = tasks.filter((t: any) => t.status === "completed").length;
  const totalTasks = tasks.length || 1;
  const progress = Math.round((completedTasks / totalTasks) * 100);
  const uploadedDocs = docs.filter((d: any) => d.status !== "required").length;
  const todayTasks = tasks.filter((t: any) => t.status !== "completed").slice(0, 3);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const loading = tasksLoading || docsLoading;

  if (loading) {
    return (
      <div className="space-y-6 p-2">
        <Skeleton variant="card" />
        <div className="grid gap-4 sm:grid-cols-3"><Skeleton variant="card" /><Skeleton variant="card" /><Skeleton variant="card" /></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-800 to-navy-900 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-navy-200">{greeting()} 👋</p>
            <h2 className="mt-1 text-2xl font-bold">{user?.displayName ?? "Employee"}</h2>
            <div className="mt-2 flex items-center gap-3 text-sm text-navy-300">
              <span>Onboarding {progress < 100 ? "In Progress" : "Complete"}</span>
            </div>
          </div>
          <ProgressCircle value={progress} size={100} strokeWidth={8} />
        </div>
      </div>

      {/* Stats */}
      <div className="stagger-children grid gap-4 sm:grid-cols-3">
        <StatCard label="Today's Tasks" value={String(todayTasks.length)} detail={`${completedTasks} completed, ${tasks.length - completedTasks} remaining`} icon={<CheckSquare size={18} />} />
        <StatCard label="Overall Progress" value={`${progress}%`} detail={`${completedTasks} of ${tasks.length} tasks done`} icon={<TrendingUp size={18} />} trend={progress >= 50 ? "up" : undefined} />
        <StatCard label="Documents" value={`${uploadedDocs}/${docs.length}`} detail={`${uploadedDocs} uploaded, ${docs.length - uploadedDocs} pending`} icon={<FileText size={18} />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Today's Tasks */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Today's Tasks</h3>
            <Link to="/employee/checklist" className="text-xs font-medium text-navy-600 hover:text-navy-800">View all →</Link>
          </div>
          {todayTasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">All tasks completed! 🎉</p>
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task: any) => (
                <div key={task.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${task.status === "in_progress" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
                    <CheckSquare size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{task.title}</p>
                    <p className="text-xs text-slate-400">{task.description}</p>
                  </div>
                  <StatusBadge variant={task.status === "in_progress" ? "in_progress" : "pending"} label={task.dayLabel} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: "/employee/documents", label: "Upload Documents", icon: <Upload size={18} /> },
              { to: "/employee/faq", label: "View FAQs", icon: <HelpCircle size={18} /> },
              { to: "/employee/chat", label: "Ask Chatbot", icon: <MessageSquare size={18} /> },
              { to: "/employee/checklist", label: "My Tasks", icon: <CheckSquare size={18} /> },
            ].map((a) => (
              <Link key={a.to} to={a.to} className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 text-center transition-all hover:border-navy-200 hover:bg-navy-50/30 hover:shadow-sm">
                <div className="text-slate-400">{a.icon}</div>
                <span className="text-xs font-medium text-slate-600">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
