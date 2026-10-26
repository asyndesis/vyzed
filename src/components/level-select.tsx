import {
  MAX_LEVEL,
  MIN_LEVEL,
  levelLabel,
  type SkillFramework,
} from "@/lib/skills";
import {
  Select,
  SelectContent,
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
  className = "h-8 w-44",
}: {
  value: number;
  onChange: (level: number) => void;
  framework?: SkillFramework;
  className?: string;
}) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LEVELS.map((l) => (
          <SelectItem key={l} value={String(l)}>
            {levelLabel(l, framework)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
