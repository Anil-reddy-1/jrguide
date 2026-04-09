import type { ReactNode } from "react";
import clsx from "clsx";

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
};

export const PageHeader = ({ title, subtitle, action, className }: Props) => {
  return (
    <section
      className={clsx(
        "mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {action && <div className="mt-2 sm:mt-0">{action}</div>}
    </section>
  );
};
