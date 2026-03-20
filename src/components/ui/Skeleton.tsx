import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-nb-surface-dark border-2 border-nb-primary flex items-center justify-center",
        className
      )}
    >
      <Loader2 size={24} className="animate-spin text-nb-text-muted opacity-40" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center gap-2 mb-4 text-nb-text-muted">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-xs font-headline font-bold uppercase tracking-wider">
          Loading data...
        </span>
      </div>
      <div className="h-10 w-full animate-pulse bg-nb-surface-dark border-2 border-nb-primary" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-2">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-12 flex-1 animate-pulse bg-nb-surface-dark border-2 border-nb-primary"
              style={{ animationDelay: `${(i * cols + j) * 50}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="border-4 border-nb-primary bg-nb-surface p-4 neo-shadow">
      <div className="mb-3 h-4 w-24 animate-pulse bg-nb-surface-dark" />
      <div className="h-8 w-32 animate-pulse bg-nb-surface-dark" />
    </div>
  );
}

export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-12">
      <div className="border-4 border-nb-primary bg-nb-yellow p-4 neo-shadow">
        <Loader2 size={32} className="animate-spin text-nb-primary" />
      </div>
      <span className="text-sm font-headline font-black uppercase tracking-wider text-nb-text-muted">
        {text}
      </span>
    </div>
  );
}
