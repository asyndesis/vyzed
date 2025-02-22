import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(
  ({ className, type, iconLeft, iconRight, ...props }, ref) => {
    return (
      <div className={cn("relative flex items-center", className)}>
        {iconLeft && (
          <span className="absolute left-3 flex items-center text-muted-foreground">
            {iconLeft}
          </span>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            iconLeft ? "pl-10" : "pl-3", // Adjust left padding
            iconRight ? "pr-10" : "pr-3" // Adjust right padding
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
  }
);

Input.displayName = "Input";

export { Input };
