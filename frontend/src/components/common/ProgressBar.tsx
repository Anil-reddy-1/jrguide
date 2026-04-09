import clsx from "clsx";

type Props = {
  value: number; // 0..100
  label?: string;
  size?: "sm" | "md";
  color?: "blue" | "green" | "amber" | "red";
  className?: string;
};

const colorMap = {
  blue: "bg-navy-500",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

const trackMap = {
  blue: "bg-navy-100",
  green: "bg-emerald-100",
  amber: "bg-amber-100",
  red: "bg-red-100",
};

export const ProgressBar = ({
  value,
  label,
  size = "md",
  color = "blue",
  className,
}: Props) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={clsx("w-full", className)}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">{label}</span>
          <span className="text-sm font-semibold text-slate-900">{clamped}%</span>
        </div>
      )}
      <div
        className={clsx(
          "w-full overflow-hidden rounded-full",
          trackMap[color],
          size === "sm" ? "h-1.5" : "h-2.5",
        )}
      >
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-700 ease-out",
            colorMap[color],
          )}
          style={{ width: `${clamped}%`, animation: "progressFill 0.8s ease-out" }}
        />
      </div>
    </div>
  );
};
