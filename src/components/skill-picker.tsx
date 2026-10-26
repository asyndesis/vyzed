import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus, X, type LucideIcon } from "lucide-react";
import type { SkillFramework } from "@/lib/skills";
import { LevelSelect } from "@/components/level-select";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { skillTreeQuery } from "@/lib/skill-queries";

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
  const { data } = useSuspenseQuery(skillTreeQuery);
  const groups = data.skills
    .filter((c) => !category || c.slug === category)
    .map((c) => ({
      value: c.name,
      items: c.children.filter((s) => !excludeIds.includes(s.id)),
    }));

  return (
    <Combobox
      items={groups}
      value={null}
      onValueChange={(skill: PickedSkill | null) => skill && onSelect(skill)}
      itemToStringLabel={(skill: PickedSkill) => skill.name}
    >
      <ComboboxTrigger
        render={<Button type="button" variant="outline" size="sm" />}
      >
        <Plus /> {label}
      </ComboboxTrigger>
      <ComboboxContent className="w-64">
        <ComboboxInput placeholder="Search…" showTrigger={false} />
        <ComboboxEmpty>No matches.</ComboboxEmpty>
        <ComboboxList>
          {(group: (typeof groups)[number]) => (
            <ComboboxGroup key={group.value} items={group.items}>
              {groups.length > 1 && (
                <ComboboxLabel>{group.value}</ComboboxLabel>
              )}
              <ComboboxCollection>
                {(skill: PickedSkill) => (
                  <ComboboxItem key={skill.id} value={skill}>
                    {skill.name}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

// Editable list of skills with a level each
export function SkillListEditor({
  value,
  onChange,
  category,
  icon: Icon,
  emptyTitle,
  emptyDescription,
  addLabel,
}: {
  value: SkillItem[];
  onChange: (value: SkillItem[]) => void;
  category?: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  addLabel?: string;
}) {
  const update = (skillId: string, proficiency: number) =>
    onChange(
      value.map((v) => (v.skillId === skillId ? { ...v, proficiency } : v)),
    );
  const add = (
    <SkillCombobox
      category={category}
      label={addLabel}
      excludeIds={value.map((v) => v.skillId)}
      onSelect={(skill) =>
        onChange([...value, { skillId: skill.id, proficiency: 3, skill }])
      }
    />
  );

  if (value.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon />
          </EmptyMedia>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>{add}</EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <ItemGroup className="gap-2">
        {value.map((item) => (
          <Item key={item.skillId} variant="outline" size="sm">
            <ItemContent>
              <ItemTitle>{item.skill.name}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <LevelSelect
                value={item.proficiency}
                framework={item.skill.framework}
                onChange={(p) => update(item.skillId, p)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() =>
                  onChange(value.filter((v) => v.skillId !== item.skillId))
                }
                aria-label={`Remove ${item.skill.name}`}
              >
                <X />
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
      <div>{add}</div>
    </div>
  );
}
