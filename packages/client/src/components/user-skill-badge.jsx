import { Badge } from "@/components/ui/badge";
import { renderProficiency } from "@/lib/utils";
import { X } from "lucide-react";

const UserSkillBadge = ({ userSkill, onClick, onRemove }) => {
  return (
    <Badge
      key={userSkill.id}
      variant="secondary"
      className={`flex items-center gap-1 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {userSkill.skill.name}
      <span className="ml-1 text-xs opacity-70 truncate overflow-hidden">
        {renderProficiency({
          proficiency: userSkill.proficiency,
          framework: userSkill.skill.framework,
        })}
      </span>
      {onRemove && (
        <div
          className="h-4 w-4 ml-auto -mr-1 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(userSkill);
          }}
        >
          <X className="h-2.5 w-2.5" />
        </div>
      )}
    </Badge>
  );
};

export default UserSkillBadge;
