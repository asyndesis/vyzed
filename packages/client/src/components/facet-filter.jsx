"use client";
import { Check, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const Pill = ({ children }) => (
  <span className="max-w-32 truncate rounded bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground">
    {children}
  </span>
);

// Multi-select filter button: dashed when empty, lists picks when active.
// groups: [{ label?, options: [{ value, label }] }]
export function FacetFilter({ title, icon: Icon = PlusCircle, groups, selected, onChange }) {
  const all = groups.flatMap((g) => g.options);
  const picked = all.filter((o) => selected.includes(o.value));
  const toggle = (v) =>
    onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-9 gap-1.5", !picked.length && "border-dashed shadow-none")}
        >
          <Icon className="text-muted-foreground" />
          {title}
          {picked.length > 0 && (
            <>
              <span className="mx-0.5 h-4 w-px bg-border" />
              <Pill>
                {picked.length > 1 ? `${picked.length} selected` : picked[0].label}
              </Pill>
            </>
          )}
        </Button>
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
                          "flex h-4 w-4 items-center justify-center rounded-[4px] border border-input",
                          on && "border-primary bg-primary text-primary-foreground",
                        )}
                      >
                        {on && <Check className="h-3 w-3" />}
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
                  <CommandItem onSelect={() => onChange([])} className="justify-center">
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
