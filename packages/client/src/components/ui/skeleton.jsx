import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// A placeholder line that takes the exact height of real text. Give it the same
// text-size class as the content it stands in for (e.g. "text-sm w-32").
function SkeletonText({ className }) {
  return (
    <div className={cn("relative", className)} aria-hidden>
      <span className="invisible">&nbsp;</span>
      <span className="absolute inset-x-0 top-1/2 h-[0.7em] -translate-y-1/2 animate-pulse rounded bg-muted" />
    </div>
  );
}

export { Skeleton, SkeletonText };
