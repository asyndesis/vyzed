import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { ArrowLeftRight, Languages } from "lucide-react";
import { SkillBadges } from "@/components/skill-badges";
import { UserAvatar } from "@/components/user-avatar";
import { formatPrice, fullName } from "@/lib/format";
import {
  graphql,
  readFragment,
  type FragmentOf,
  type ResultOf,
} from "@/lib/gql";

export const TeacherCardFields = graphql(`
  fragment TeacherCardFields on User {
    id
    firstName
    lastInitial
    image
    bio
    priceAmount
    priceCurrency
    allowBarter
    teaches: skills(kind: teaches) {
      proficiency
      skill {
        id
        name
        framework
      }
    }
    speaks: skills(kind: speaks) {
      skill {
        id
        name
      }
    }
  }
`);

export type TeacherCardUser = ResultOf<typeof TeacherCardFields>;

export function TeacherCard({
  data,
  to,
}: {
  data: FragmentOf<typeof TeacherCardFields>;
  to: "/browse/$id" | "/dashboard/teachers/$id";
}) {
  return (
    <TeacherCardView user={readFragment(TeacherCardFields, data)} to={to} />
  );
}

// The card for an already-read user, e.g. a live preview of a profile being edited
export function TeacherCardView({
  user,
  to,
}: {
  user: TeacherCardUser;
  to: "/browse/$id" | "/dashboard/teachers/$id";
}) {
  return (
    <Link to={to} params={{ id: user.id }}>
      <Card>
        <TeacherCardBody user={user} />
      </Card>
    </Link>
  );
}

function TeacherCardBody({ user }: { user: TeacherCardUser }) {
  const price = formatPrice(user.priceAmount, user.priceCurrency);
  return (
    <CardContent className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <UserAvatar user={user} className="size-12" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{fullName(user)}</h3>
          {user.speaks.length > 0 && (
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <Languages className="size-3 shrink-0" />
              {user.speaks.map((l) => l.skill.name).join(", ")}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-semibold">
            {price ?? "Free"}
            {price && (
              <span className="text-xs font-normal text-muted-foreground">
                /hr
              </span>
            )}
          </p>
          {user.allowBarter && (
            <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
              <ArrowLeftRight className="size-3" /> Swaps
            </p>
          )}
        </div>
      </div>

      <SkillBadges items={user.teaches} max={4} />

      {user.bio && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{user.bio}</p>
      )}
    </CardContent>
  );
}
