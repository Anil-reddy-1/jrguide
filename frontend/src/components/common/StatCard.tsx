import clsx from "clsx";
import type { ReactNode } from "react";

type Props = {
  label: string;
  value: string | number;
  detail?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  className?: string;
};

export const StatCard = ({
  label,
  value,
  detail,
  icon,
  trend,
  trendLabel,
  className,
}: Props) => {
  return (
    <article
      className={clsx(
        "group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
            {icon}
          </div>
        )}
      </div>
      {(detail || trendLabel) && (
        <div className="mt-3 flex items-center gap-2">
          {trend && (
            <span
              className={clsx(
                "text-xs font-semibold",
                trend === "up" && "text-emerald-600",
                trend === "down" && "text-red-500",
                trend === "neutral" && "text-slate-400",
              )}
            >
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}{" "}
              {trendLabel}
            </span>
          )}
          {detail && (
            <span className="text-xs text-slate-500">{detail}</span>
          )}
        </div>
      )}
    </article>
  );
};
