import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline" | "yellow";
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function Badge({ variant = "default", className, style, children }: BadgeProps) {
  const variants = {
    default: "bg-nb-surface-dim text-nb-text border-2 border-nb-primary",
    success: "bg-nb-blue text-white border-2 border-nb-primary",
    warning: "bg-nb-yellow text-nb-primary border-2 border-nb-primary",
    danger: "bg-nb-red text-white border-2 border-nb-primary",
    info: "bg-nb-blue text-white border-2 border-nb-primary",
    outline: "border-2 border-nb-primary text-nb-text",
    yellow: "bg-nb-yellow text-nb-primary border-2 border-nb-primary",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-black font-headline uppercase",
        variants[variant],
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}
