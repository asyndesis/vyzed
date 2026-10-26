import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import type { SkillFramework } from "@/features/skills/rules";
import { LevelSelect } from "@/features/skills/level-select";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { skillTreeQuery } from "@/features/skills/queries";

export type PickedSkill = {
  id: string;
  name: string;
  framework: SkillFramework;
};
export type SkillItem = {
  skillId: string;
  proficiency: number;
  skill: PickedSkill;
};

// Searchable popover for picking one skill, optionally from a single category
export function SkillCombobox({
  category,
  excludeIds = [],
  onSelect,
  label = "Add skill",
}: {
  category?: string;
  excludeIds?: string[];
  onSelect: (skill: PickedSkill) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const { data } = useSuspenseQuery(skillTreeQuery);
  const categories = category
    ? data.skills.filter((c) => c.slug === category)
    : data.skills;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={<Button type="button" variant="outline" size="sm" />}
      >
        <Plus /> {label}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>
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

// Editable list of skills with a level each
export function SkillListEditor({
  value,
  onChange,
  category,
  emptyText,
  addLabel,
}: {
  value: SkillItem[];
  onChange: (value: SkillItem[]) => void;
  category?: string;
  emptyText: string;
  addLabel?: string;
}) {
  const update = (skillId: string, proficiency: number) =>
    onChange(
      value.map((v) => (v.skillId === skillId ? { ...v, proficiency } : v)),
    );

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
            onChange={(p) => update(item.skillId, p)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            onClick={() =>
              onChange(value.filter((v) => v.skillId !== item.skillId))
            }
            aria-label={`Remove ${item.skill.name}`}
          >
            <X />
          </Button>
        </div>
      ))}
      <SkillCombobox
        category={category}
        label={addLabel}
        excludeIds={value.map((v) => v.skillId)}
        onSelect={(skill) =>
          onChange([...value, { skillId: skill.id, proficiency: 3, skill }])
        }
      />
    </div>
  );
}
