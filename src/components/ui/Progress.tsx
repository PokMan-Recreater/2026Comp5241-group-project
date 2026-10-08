import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  tone = "brand",
  label,
}: {
  /** 0-100. */
  value: number;
  className?: string;
  tone?: "brand" | "emerald" | "amber";
  label?: string;
}) {
  const width = Math.max(0, Math.min(100, Math.round(value)));
  const toneClass = {
    brand: "bg-gradient-to-r from-brand-500 to-sky-400",
    emerald: "bg-gradient-to-r from-emerald-500 to-lime-400",
    amber: "bg-gradient-to-r from-amber-500 to-orange-400",
  }[tone];

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-slate-400">
          <span>{label}</span>
          <span>{width}%</span>
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={width}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <div className={cn("h-full rounded-full transition-all", toneClass)} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function ProgressRing({
  value,
  size = 96,
  children,
}: {
  value: number;
  size?: number;
  children?: React.ReactNode;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const radius = size / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={8}
          className="stroke-white/10"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-brand-400 transition-all"
          fill="none"
        />
      </svg>
      <div className="absolute text-center">
        {children ?? <span className="text-lg font-bold text-white">{clamped}%</span>}
      </div>
    </div>
  );
}
