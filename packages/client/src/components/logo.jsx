import { cn } from "@/lib/utils";

export function LogoMark({ className }) {
  return (
    <span
      className={cn(
        "flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 6l7 12 7-12" />
      </svg>
    </span>
  );
}

export function Logo({ className }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-display text-base font-semibold">vyzed</span>
    </span>
  );
}
