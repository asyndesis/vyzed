import { Check, PlusCircle, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type FacetGroup = {
  label?: string;
  options: Array<{ value: string; label: string }>;
};

// Multi-select filter (shadcn data-table pattern): dashed when empty, shows picks when active
export function FacetFilter({
  title,
  icon: Icon = PlusCircle,
  groups,
  selected,
  onChange,
}: {
  title: string;
  icon?: LucideIcon;
  groups: FacetGroup[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const picked = groups
    .flatMap((g) => g.options)
    .filter((o) => selected.includes(o.value));
  const toggle = (v: string) =>
    onChange(
      selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v],
    );

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn("h-9", !picked.length && "border-dashed shadow-none")}
          />
        }
      >
        <Icon className="text-muted-foreground" />
        {title}
        {picked.length > 0 && (
          <>
            <span className="mx-0.5 h-4 w-px bg-border" />
            <span className="max-w-32 truncate rounded bg-secondary px-1.5 py-0.5 text-xs font-medium">
              {picked.length > 1
                ? `${picked.length} selected`
                : picked[0].label}
            </span>
          </>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            {groups.map((g, i) => (
              <CommandGroup key={g.label ?? i} heading={g.label}>
                {g.options.map((o) => {
                  const on = selected.includes(o.value);
                  return (
                    <CommandItem
                      key={o.value}
                      value={`${g.label ?? ""} ${o.label}`}
                      onSelect={() => toggle(o.value)}
                    >
                      <span
                        className={cn(
                          "flex size-4 items-center justify-center rounded-[4px] border border-input",
                          on &&
                            "border-primary bg-primary text-primary-foreground",
                        )}
                      >
                        {on && (
                          <Check className="size-3 text-primary-foreground" />
                        )}
                      </span>
                      {o.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
            {picked.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange([])}
                    className="justify-center"
                  >
                    Clear
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
