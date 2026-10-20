import * as React from "react"
import { cn } from "@/lib/utils"

// Optional iconLeft/iconRight sit inside the field; wrapperClassName sizes the wrapper
function Input({ className, wrapperClassName, type, iconLeft, iconRight, ...props }) {
  const input = (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        iconLeft && "pl-10",
        iconRight && "pr-10",
        className
      )}
      {...props}
    />
  )
  if (!iconLeft && !iconRight && !wrapperClassName) return input

  return (
    <div className={cn("relative flex items-center", wrapperClassName)}>
      {iconLeft && (
        <span className="absolute left-3 flex items-center text-muted-foreground">{iconLeft}</span>
      )}
      {input}
      {iconRight && (
        <span className="absolute right-3 flex items-center text-muted-foreground">{iconRight}</span>
      )}
    </div>
  )
}

export { Input }
