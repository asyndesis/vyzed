import { Link } from "@tanstack/react-router";
import { ArrowLeftRight, Languages } from "lucide-react";
import { SkillBadges } from "@/features/skills/skill-badges";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
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
  const user = readFragment(TeacherCardFields, data);
  return (
    <Link
      to={to}
      params={{ id: user.id }}
      className="flex flex-col gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/20"
    >
      <TeacherCardBody user={user} />
    </Link>
  );
}

// The card's contents without the link, for previews of a profile being edited
export function TeacherCardBody({ user }: { user: TeacherCardUser }) {
  const price = formatPrice(user.priceAmount, user.priceCurrency);
  return (
    <>
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
            <p className="flex items-center justify-end gap-1 text-xs text-success">
              <ArrowLeftRight className="size-3" /> Swaps
            </p>
          )}
        </div>
      </div>

      <SkillBadges items={user.teaches} max={4} />

      {user.bio && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{user.bio}</p>
      )}
    </>
  );
}

// Same boxes and line heights as TeacherCard, so the swap doesn't shift anything
export function TeacherCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="size-12 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <SkeletonText className="w-32" />
          <SkeletonText className="w-24 text-xs" />
        </div>
        <SkeletonText className="w-14" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-[22px] w-28 rounded-full" />
        <Skeleton className="h-[22px] w-20 rounded-full" />
      </div>
      <div>
        <SkeletonText className="w-full text-sm" />
        <SkeletonText className="w-2/3 text-sm" />
      </div>
    </div>
  );
}
