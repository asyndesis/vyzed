import { Badge } from "@/components/ui/badge";
import { renderProficiency } from "@/lib/utils";

export function SkillBadge({ item, showLevel = true }) {
  return (
    <Badge variant="outline" className="gap-1 font-medium">
      {item.skill.name}
      {showLevel && (
        <span className="font-normal text-muted-foreground">
          · {renderProficiency({
            proficiency: item.proficiency,
            framework: item.skill.framework,
          })}
        </span>
      )}
    </Badge>
  );
}

export function SkillBadges({ items = [], max, showLevel }) {
  const shown = max ? items.slice(0, max) : items;
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((item) => (
        <SkillBadge key={item.id} item={item} showLevel={showLevel} />
      ))}
      {max && items.length > max && (
        <Badge variant="outline" className="text-muted-foreground">
          +{items.length - max}
        </Badge>
      )}
    </div>
  );
}
