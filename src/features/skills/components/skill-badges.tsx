import type { SkillFramework } from "@/features/skills/lib/rules";
import { levelLabel } from "@/features/skills/lib/rules";
import { Badge } from "@/components/ui/badge";

type Item = {
  proficiency: number;
  skill: { id: string; name: string; framework: SkillFramework };
};

export function SkillBadges({
  items,
  max,
  showLevel = true,
}: {
  items: readonly Item[];
  max?: number;
  showLevel?: boolean;
}) {
  const shown = max ? items.slice(0, max) : items;
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((item) => (
        <Badge key={item.skill.id} variant="outline" className="gap-1">
          {item.skill.name}
          {showLevel && (
            <span className="font-normal text-muted-foreground">
              · {levelLabel(item.proficiency, item.skill.framework)}
            </span>
          )}
        </Badge>
      ))}
      {max && items.length > max && (
        <Badge variant="outline">+{items.length - max}</Badge>
      )}
    </div>
  );
}
