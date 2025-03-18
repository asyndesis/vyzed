import { Badge } from "@/components/ui/badge";
import { renderProficiency } from "@/lib/utils";

const UserSkillBadge = ({ userSkill }) => {
  return (
    <Badge
      key={userSkill.id}
      variant="secondary"
      className="flex items-center gap-1"
    >
      {userSkill.skill.name}
      <span className="ml-1 text-xs opacity-70">
        {renderProficiency({ level: userSkill.proficiency })}
      </span>
    </Badge>
  );
};

export default UserSkillBadge;
