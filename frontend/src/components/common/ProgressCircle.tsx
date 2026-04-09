import clsx from "clsx";

type Props = {
  value: number; // 0..100
  size?: number; // px diameter
  strokeWidth?: number;
  className?: string;
};

export const ProgressCircle = ({
  value,
  size = 100,
  strokeWidth = 8,
  className,
}: Props) => {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={clsx("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1B2B50"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.8s ease-out",
            // @ts-expect-error -- CSS custom prop
            "--circumference": circumference,
            animation: "circleProgress 1s ease-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-900">{clamped}%</span>
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
          Done
        </span>
      </div>
    </div>
  );
};
