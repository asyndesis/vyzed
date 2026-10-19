import Link from "next/link";
import { ArrowLeftRight, Languages } from "lucide-react";
import { fullName, formatPrice } from "@/lib/format";
import { UserAvatar } from "@/components/user-avatar";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { SkillBadges } from "@/components/skill-badge";

export function TeacherCard({ user }) {
  const tp = user.teacherProfile;
  const price = formatPrice(tp?.priceAmount, tp?.priceCurrency);
  const languages = user.userProfile?.languages ?? [];

  return (
    <Link
      href={`/dashboard/teachers/${user.id}`}
      className="group flex flex-col gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/20"
    >
      <div className="flex items-start gap-3">
        <UserAvatar user={user} className="h-12 w-12" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">
            {fullName(user)}
          </h3>
          {languages.length > 0 && (
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <Languages className="h-3 w-3 shrink-0" />
              {languages.map((l) => l.skill.name).join(", ")}
            </p>
          )}
        </div>
        <div className="text-right">
          {price ? (
            <p className="font-semibold">
              {price}
              <span className="text-xs font-normal text-muted-foreground">/hr</span>
            </p>
          ) : (
            <p className="text-sm font-medium text-muted-foreground">Free</p>
          )}
          {tp?.allowBarter && (
            <p className="flex items-center justify-end gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <ArrowLeftRight className="h-3 w-3" /> Swaps
            </p>
          )}
        </div>
      </div>

      <SkillBadges items={tp?.skills ?? []} max={4} />

      {user.userProfile?.bio && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {user.userProfile.bio}
        </p>
      )}
    </Link>
  );
}

// Mirrors TeacherCard's boxes and line heights so the swap doesn't shift anything
export function TeacherCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
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
