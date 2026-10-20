import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-accent", className)}
      {...props}
    />
  );
}

// A placeholder line exactly as tall as real text. Give it the same text-size
// class as the content it stands in for (e.g. "text-sm w-32") so nothing shifts.
function SkeletonText({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)} aria-hidden>
      <span className="invisible">&nbsp;</span>
      <span className="absolute inset-x-0 top-1/2 h-[0.7em] -translate-y-1/2 animate-pulse rounded bg-accent" />
    </div>
  );
}

export { Skeleton, SkeletonText };
