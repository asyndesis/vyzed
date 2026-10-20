import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Wraps a skeleton. Visible from the server render on; content that replaces
// it fades in via FadeIn. With no children, a spinner.
export function Loading({ className, children }) {
  return (
    <div aria-busy className={cn(!children && "flex justify-center py-16", className)}>
      {children ?? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
    </div>
  );
}

// Wrap content that appears after loading so it eases in instead of popping
export function FadeIn({ className, children }) {
  return <div className={cn("animate-in fade-in duration-300", className)}>{children}</div>;
}

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-14 text-center",
        className,
      )}
    >
      {Icon && (
        // Icon tile with a faint halo ring behind it
        <div className="relative mb-5">
          <div className="absolute -inset-2.5 rounded-[1.25rem] border border-dashed border-border/70" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border bg-card shadow-sm">
            <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
          </div>
        </div>
      )}
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground text-balance">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageTitle({ title, description, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
