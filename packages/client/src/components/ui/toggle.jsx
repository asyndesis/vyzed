
import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"
import { Toggle as TogglePrimitive } from "radix-ui"

const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground data-[state=on]:bg-accent data-[state=on]:text-foreground",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent data-[state=on]:bg-accent data-[state=on]:text-foreground",
        // Filter-bar toggle: dashed when off, solid with a lit switch when on
        filter:
          "border border-dashed border-input bg-background text-[13px] hover:bg-accent data-[state=on]:border-solid data-[state=on]:shadow-xs [&_svg]:text-muted-foreground",
      },
      size: {
        default: "h-9 min-w-9 px-3",
        sm: "h-8 min-w-8 px-2.5 text-[13px]",
        lg: "h-10 min-w-10 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Tiny switch track shown inside filter toggles
const Indicator = () => (
  <span className="relative ml-0.5 inline-flex h-4 w-7 shrink-0 items-center rounded-full bg-input transition-colors group-data-[state=on]/toggle:bg-primary">
    <span className="ml-0.5 h-3 w-3 rounded-full bg-background shadow-sm transition-transform group-data-[state=on]/toggle:translate-x-3" />
  </span>
)

function Toggle({
  className,
  variant,
  size,
  children,
  ...props
}) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    >
      {children}
      {variant === "filter" && <Indicator />}
    </TogglePrimitive.Root>
  )
}

export { Toggle, toggleVariants }
