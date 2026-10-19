"use client";
import { useState } from "react";
import { useQuery } from "@apollo/client";
import { Plus, X } from "lucide-react";
import { ROOT_SKILLS } from "@/lib/graphql";
import { renderProficiency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LEVELS = [1, 2, 3, 4, 5, 6, 7];

export function useSkillCategories(categoryId) {
  const { data, loading } = useQuery(ROOT_SKILLS);
  const roots = data?.rootSkills ?? [];
  return {
    loading,
    categories: categoryId ? roots.filter((r) => r.id === categoryId) : roots,
  };
}

// Searchable popover for picking one skill. Used by the editor and filters.
export function SkillCombobox({
  categoryId,
  excludeIds = [],
  onSelect,
  label = "Add skill",
  variant = "outline",
  size = "sm",
}) {
  const [open, setOpen] = useState(false);
  const { categories, loading } = useSkillCategories(categoryId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant={variant} size={size} className="gap-1">
          <Plus className="h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>{loading ? "Loading…" : "No matches."}</CommandEmpty>
            {categories.map((cat) => (
              <CommandGroup
                key={cat.id}
                heading={categories.length > 1 ? cat.name : undefined}
              >
                {cat.children
                  .filter((s) => !excludeIds.includes(s.id))
                  .map((skill) => (
                    <CommandItem
                      key={skill.id}
                      value={`${cat.name} ${skill.name}`}
                      onSelect={() => {
                        onSelect(skill);
                        setOpen(false);
                      }}
                    >
                      {skill.name}
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function LevelSelect({ value, onChange, framework, className }) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger className={className ?? "h-8 w-44"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LEVELS.map((l) => (
          <SelectItem key={l} value={String(l)}>
            {renderProficiency({ proficiency: l, framework })}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Editable list of { id?, skillId, proficiency, skill }
export function SkillListEditor({ value, onChange, categoryId, emptyText, addLabel }) {
  const update = (skillId, patch) =>
    onChange(value.map((v) => (v.skillId === skillId ? { ...v, ...patch } : v)));

  return (
    <div className="space-y-2">
      {value.length === 0 && (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      )}
      {value.map((item) => (
        <div
          key={item.skillId}
          className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2"
        >
          <span className="flex-1 truncate text-sm font-medium">
            {item.skill.name}
          </span>
          <LevelSelect
            value={item.proficiency}
            framework={item.skill.framework}
            onChange={(proficiency) => update(item.skillId, { proficiency })}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={() =>
              onChange(value.filter((v) => v.skillId !== item.skillId))
            }
            aria-label={`Remove ${item.skill.name}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <SkillCombobox
        categoryId={categoryId}
        label={addLabel}
        excludeIds={value.map((v) => v.skillId)}
        onSelect={(skill) =>
          onChange([...value, { skillId: skill.id, proficiency: 3, skill }])
        }
      />
    </div>
  );
}
