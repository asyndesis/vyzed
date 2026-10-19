import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(
  ({ className, wrapperClassName, type, iconLeft, iconRight, ...props }, ref) => {
    return (
      <div className={cn("relative flex items-center", wrapperClassName)}>
        {iconLeft && (
          <span className="absolute left-3 flex items-center text-muted-foreground">
            {iconLeft}
          </span>
        )}
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-lg border border-input bg-background text-base shadow-sm transition-[color,box-shadow] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            iconLeft ? "pl-10" : "pl-3", // Adjust left padding
            iconRight ? "pr-10" : "pr-3", // Adjust right padding
            className,
          )}
          ref={ref}
          {...props}
        />
        {iconRight && (
          <span className="absolute right-3 flex items-center text-muted-foreground">
            {iconRight}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
