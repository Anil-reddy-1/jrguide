import { useAuth } from "../../state/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../config/api";
import { PageHeader } from "../../components/common/PageHeader";
import { Skeleton } from "../../components/common/Skeleton";
import {
  FileText,
  ListChecks,
  Info,
  AlertTriangle,
  Check,
  CheckCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

const typeIcon = (type: string) => {
  switch (type) {
    case "task":
      return <ListChecks size={16} />;
    case "document":
      return <FileText size={16} />;
    case "reminder":
      return <AlertTriangle size={16} />;
    default:
      return <Info size={16} />;
  }
};

const typeColor = (type: string) => {
  switch (type) {
    case "task":
      return "bg-blue-50 text-blue-500";
    case "document":
      return "bg-amber-50 text-amber-500";
    case "reminder":
      return "bg-red-50 text-red-500";
    default:
      return "bg-slate-100 text-slate-500";
  }
};

export const EmployeeNotificationsPage = () => {
  const { user } = useAuth();
  const uid = user?.uid ?? "";
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", uid],
    queryFn: () => apiClient<any[]>(`/api/notifications/${uid}`),
    enabled: !!uid,
    retry: 2,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications", uid] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () =>
      apiClient(`/api/notifications/read-all/${uid}`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", uid] });
      toast.success("All marked as read");
    },
  });

  const unread = notifications.filter((n: any) => !n.read).length;

  const formatTime = (ts: any) => {
    if (!ts) return "";
    const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="row" count={5} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread notification${unread !== 1 ? "s" : ""}`}
        action={
          unread > 0 ? (
            <button
              type="button"
              onClick={() => markAllMutation.mutate()}
              className="flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-2 text-xs font-medium text-white hover:bg-navy-800"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          ) : undefined
        }
      />

      <div className="space-y-2">
        {notifications.map((notif: any) => (
          <div
            key={notif.id}
            className={clsx(
              "flex items-start gap-3 rounded-xl border p-4 transition-all",
              notif.read
                ? "border-slate-100 bg-white"
                : "border-navy-100 bg-navy-50/30",
            )}
          >
            <div
              className={clsx(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                typeColor(notif.type),
              )}
            >
              {typeIcon(notif.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className={clsx(
                    "text-sm font-medium",
                    notif.read ? "text-slate-600" : "text-slate-900",
                  )}
                >
                  {notif.title}
                </p>
                {!notif.read && (
                  <span className="h-2 w-2 rounded-full bg-navy-500" />
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{notif.message}</p>
              <p className="mt-1 text-[10px] text-slate-400">
                {formatTime(notif.createdAt)}
              </p>
            </div>
            {!notif.read && (
              <button
                type="button"
                onClick={() => markReadMutation.mutate(notif.id)}
                className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                title="Mark as read"
              >
                <Check size={14} />
              </button>
            )}
          </div>
        ))}
        {notifications.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400">
            No notifications yet.
          </p>
        )}
      </div>
    </div>
  );
};
