import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function Badge({ variant = "default", className, style, children }: BadgeProps) {
  const variants = {
    default: "bg-zinc-800 text-zinc-300",
    success: "bg-emerald-900/50 text-emerald-400 border border-emerald-700",
    warning: "bg-amber-900/50 text-amber-400 border border-amber-700",
    danger: "bg-red-900/50 text-red-400 border border-red-700",
    info: "bg-blue-900/50 text-blue-400 border border-blue-700",
    outline: "border border-zinc-700 text-zinc-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}
