import { Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@apollo/client/react";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowLeftRight,
  BookOpen,
  GraduationCap,
  Languages,
  UserX,
} from "lucide-react";
import { PUBLIC_USER } from "@/lib/graphql";
import { formatPrice, fullName } from "@/lib/format";
import { useMe } from "@/hooks/use-me";
import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { SkillBadges } from "@/components/skill-badge";
import { EmptyState, Loading } from "@/components/empty-state";
import { RequestLessonDialog } from "@/components/request-lesson-dialog";

// Same grid and boxes as the loaded profile below
function ProfileSkeleton() {
  return (
    <Loading className="grid gap-8 md:grid-cols-[1fr_280px]">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
          <div>
            <SkeletonText className="w-48 text-2xl" />
            <SkeletonText className="w-36 text-sm" />
          </div>
        </div>
        <div className="leading-relaxed">
          <SkeletonText className="w-full" />
          <SkeletonText className="w-full" />
          <SkeletonText className="w-1/2" />
        </div>
      </div>
      <div className="h-fit space-y-4 rounded-xl border bg-card p-5">
        <SkeletonText className="w-24 text-3xl" />
        <Skeleton className="h-10 w-full" />
      </div>
    </Loading>
  );
}

function Block({ icon: Icon, title, children }) {
  return (
    <section className="space-y-2">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Icon className="h-4 w-4" /> {title}
      </h2>
      {children}
    </section>
  );
}

// Shared by the public /browse/$id and signed-in /dashboard/teachers/$id pages
export function TeacherProfile({ id, backTo }) {
  const { me, signedIn } = useMe();
  const { data, loading } = useQuery(PUBLIC_USER, { variables: { id } });
  const user = data?.publicUserById;
  // After signing in, come back to this teacher inside the app
  const { href: bookHref } = useRouter().buildLocation({
    to: "/{-$locale}/dashboard/teachers/$id",
    params: { id },
  });

  const back = (
    <Button asChild variant="ghost" size="sm" className="-ml-2">
      <Link to={backTo}>
        <ArrowLeft className="h-4 w-4" /> All teachers
      </Link>
    </Button>
  );

  if (loading && !user) return <>{back}<ProfileSkeleton /></>;
  if (!user)
    return (
      <>
        {back}
        <EmptyState icon={UserX} title="Teacher not found" description="This profile may have been removed." />
      </>
    );

  const tp = user.teacherProfile;
  const price = formatPrice(tp?.priceAmount, tp?.priceCurrency);
  const isMe = me?.id === user.id;
  const canBook = tp?.skills?.length > 0 && !isMe;

  const bookButton = signedIn ? (
    <RequestLessonDialog teacher={user} trigger={<Button size="lg" className="w-full">Request a lesson</Button>} />
  ) : (
    <Button asChild size="lg" className="w-full">
      <Link to="/{-$locale}/sign-in" search={{ redirect: bookHref }}>Sign in to book</Link>
    </Button>
  );

  return (
    <>
      {back}
      <div className="grid gap-8 md:grid-cols-[1fr_280px]">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} className="h-20 w-20 text-2xl" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{fullName(user)}</h1>
              <p className="text-sm text-muted-foreground">
                Member since {format(new Date(user.createdAt), "MMMM yyyy")}
              </p>
            </div>
          </div>

          {user.userProfile?.bio && (
            <p className="whitespace-pre-line leading-relaxed">{user.userProfile.bio}</p>
          )}

          {tp?.skills?.length > 0 && (
            <Block icon={BookOpen} title="Teaches">
              <SkillBadges items={tp.skills} />
            </Block>
          )}
          {user.userProfile?.languages?.length > 0 && (
            <Block icon={Languages} title="Speaks">
              <SkillBadges items={user.userProfile.languages} />
            </Block>
          )}
          {user.studentProfile?.skills?.length > 0 && (
            <Block icon={GraduationCap} title={tp?.allowBarter ? "Wants to learn (swap for these)" : "Wants to learn"}>
              <SkillBadges items={user.studentProfile.skills} />
            </Block>
          )}
        </div>

        <aside className="h-fit space-y-4 rounded-xl border bg-card p-5 md:sticky md:top-20">
          <div>
            <p className="text-3xl font-bold">{price ?? "Free"}</p>
            {price && <p className="text-sm text-muted-foreground">per hour</p>}
          </div>
          {tp?.allowBarter && (
            <p className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-2.5 text-sm text-emerald-700 dark:text-emerald-400">
              <ArrowLeftRight className="h-4 w-4 shrink-0" />
              Open to swapping lessons instead of payment
            </p>
          )}
          {isMe ? (
            <Button asChild variant="outline" className="w-full">
              <Link to="/{-$locale}/dashboard/profile">Edit your profile</Link>
            </Button>
          ) : canBook ? (
            bookButton
          ) : (
            <p className="text-sm text-muted-foreground">Not taking lessons right now.</p>
          )}
        </aside>
      </div>
    </>
  );
}
