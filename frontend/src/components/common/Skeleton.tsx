import clsx from "clsx";

type Props = {
  variant?: "text" | "card" | "row" | "circle";
  className?: string;
  count?: number;
};

export const Skeleton = ({ variant = "text", className, count = 1 }: Props) => {
  const items = Array.from({ length: count });

  if (variant === "card") {
    return (
      <>
        {items.map((_, i) => (
          <div
            key={i}
            className={clsx(
              "skeleton h-32 w-full rounded-xl",
              className,
            )}
          />
        ))}
      </>
    );
  }

  if (variant === "row") {
    return (
      <>
        {items.map((_, i) => (
          <div key={i} className={clsx("flex items-center gap-3 py-3", className)}>
            <div className="skeleton h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (variant === "circle") {
    return (
      <div className={clsx("skeleton h-24 w-24 rounded-full", className)} />
    );
  }

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={clsx(
            "skeleton h-4 rounded",
            i === items.length - 1 ? "w-2/3" : "w-full",
            className,
          )}
        />
      ))}
    </>
  );
};
