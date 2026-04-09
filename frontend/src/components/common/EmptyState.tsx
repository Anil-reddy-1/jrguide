import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import clsx from "clsx";

type Props = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export const EmptyState = ({ icon, title, description, action, className }: Props) => {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-8 py-14 text-center",
        className,
      )}
    >
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {icon ?? <Inbox size={28} />}
      </div>
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
