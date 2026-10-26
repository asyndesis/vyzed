import {
  MAX_LEVEL,
  MIN_LEVEL,
  levelLabel,
  type SkillFramework,
} from "@/lib/skills";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LEVELS = Array.from(
  { length: MAX_LEVEL - MIN_LEVEL + 1 },
  (_, i) => MIN_LEVEL + i,
);

export function LevelSelect({
  value,
  onChange,
  framework,
  className = "w-56",
}: {
  value: number;
  onChange: (level: number) => void;
  framework?: SkillFramework;
  className?: string;
}) {
  const items = LEVELS.map((l) => ({
    value: String(l),
    label: levelLabel(l, framework),
  }));
  return (
    <Select
      items={items}
      value={String(value)}
      onValueChange={(v) => onChange(Number(v))}
    >
      <SelectTrigger size="sm" className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
