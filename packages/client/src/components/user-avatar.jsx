import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { fullName, initials } from "@/lib/format";

// Deterministic pastel background so fallback avatars aren't all grey
const HUES = [210, 260, 330, 20, 150, 190, 45];
const hueFor = (id = "") =>
  HUES[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length];

export function UserAvatar({ user, className }) {
  const hue = hueFor(user?.id);
  return (
    <Avatar className={cn("h-10 w-10", className)}>
      <AvatarImage src={user?.imageUrl || undefined} alt={fullName(user)} />
      <AvatarFallback
        className="font-semibold"
        style={{
          background: `hsl(${hue} 80% 92%)`,
          color: `hsl(${hue} 60% 30%)`,
        }}
      >
        {initials(user)}
      </AvatarFallback>
    </Avatar>
  );
}
