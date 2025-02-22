import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// We do it this way to account for non-retina screens
// being a bit off. Scaled + 24 for to match font-height
const ROW_SIZE_MAP = {
  1: "h-[39px]",
  2: "h-[63px]",
  3: "h-[87px]",
  4: "h-[111px]",
  5: "h-[135px]",
  6: "h-[159px]",
  7: "h-[183px]",
  8: "h-[207px]",
};

export const ScrollSequence = ({ className, children, rows = 2 }) => {
  const sizeClass = ROW_SIZE_MAP[rows] || ROW_SIZE_MAP[2];
  return (
    <ScrollArea
      className={cn(
        `${sizeClass} rounded-md border break-all bg-background font-mono`,
        className
      )}
    >
      <div className="p-2">{children}</div>
    </ScrollArea>
  );
};
