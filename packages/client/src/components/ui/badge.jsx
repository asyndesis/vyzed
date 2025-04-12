import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/80",
        secondary:
          "border-transparent bg-purple-100 text-purple-800 hover:bg-purple-100/80 dark:bg-purple-800 dark:text-purple-100 dark:hover:bg-purple-800/80",
        primary:
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-800 dark:text-blue-100 dark:hover:bg-blue-800/80",
        destructive:
          "border-transparent bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-800/80",
        outline: "bg-background text-foreground dark:border-border",
        success:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-800 dark:text-green-100 dark:hover:bg-green-800/80",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-800 dark:text-yellow-100 dark:hover:bg-yellow-800/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div
      className={cn(badgeVariants({ variant }), "w-fit", className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
