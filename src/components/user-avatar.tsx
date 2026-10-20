import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fullName, initials, type Person } from "@/lib/format";
import { cn } from "@/lib/utils";

// Stable pastel per person, so fallback avatars aren't all grey
const HUES = [210, 260, 330, 20, 150, 190, 45];
const hueFor = (id: string) =>
  HUES[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length];

export function UserAvatar({
  user,
  className,
}: {
  user: Person;
  className?: string;
}) {
  const hue = hueFor(user.id);
  return (
    <Avatar className={cn("size-10", className)}>
      <AvatarImage src={user.image ?? undefined} alt={fullName(user)} />
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
