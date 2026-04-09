import clsx from "clsx";

type StatusVariant =
  | "pending"
  | "in_progress"
  | "completed"
  | "verified"
  | "rejected"
  | "overdue"
  | "uploaded"
  | "required"
  | "optional"
  | "info"
  | "reminder"
  | "active"
  | "inactive";

const variantStyles: Record<StatusVariant, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  overdue: "bg-red-50 text-red-700 border-red-200",
  uploaded: "bg-blue-50 text-blue-700 border-blue-200",
  required: "bg-orange-50 text-orange-700 border-orange-200",
  optional: "bg-slate-50 text-slate-500 border-slate-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
  reminder: "bg-amber-50 text-amber-700 border-amber-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-slate-100 text-slate-500 border-slate-200",
};

const variantLabels: Record<StatusVariant, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  verified: "Verified",
  rejected: "Rejected",
  overdue: "Overdue",
  uploaded: "Uploaded",
  required: "Required",
  optional: "Optional",
  info: "Info",
  reminder: "Reminder",
  active: "Active",
  inactive: "Inactive",
};

type Props = {
  variant: StatusVariant;
  label?: string;
  className?: string;
};

export const StatusBadge = ({ variant, label, className }: Props) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize whitespace-nowrap",
        variantStyles[variant],
        className,
      )}
    >
      {label ?? variantLabels[variant]}
    </span>
  );
};
