import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@/lib/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
  GraduationCap,
  Search,
  Users,
  UserPen,
} from "lucide-react";
import { MY_LESSONS, TEACHERS } from "@/lib/graphql";
import { groupLessons } from "@/lib/lessons";
import { fullName, friendlyDay, timeRange } from "@/lib/format";
import { useMe } from "@/hooks/use-me";
import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { EmptyState, FadeIn, Loading } from "@/components/empty-state";
import { UserAvatar } from "@/components/user-avatar";
import { LessonCard, StatusPill } from "@/components/lesson-card";
import { TeacherCard, TeacherCardSkeleton } from "@/components/teacher-card";

// Time of day only exists on the client; null until mounted keeps SSR in sync
function useGreeting() {
  const [text, setText] = useState(null);
  useEffect(() => {
    const h = new Date().getHours();
    setText(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);
  return text;
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function summary({ action, upcoming }) {
  if (action.length) return `${plural(action.length, "lesson")} waiting on you.`;
  if (upcoming.length) return `${plural(upcoming.length, "lesson")} coming up.`;
  return "Your calendar is clear — a good time to learn something new.";
}

function Section({ title, children, href, linkLabel = "See all" }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h2>
        {href && (
          <Link href={href} className="text-sm text-primary hover:underline">
            {linkLabel}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

// The very next lesson, given pride of place
function NextLesson({ lesson, role }) {
  const enrollment = lesson.enrollments[0];
  const other = role === "teacher" ? enrollment?.student : lesson.teacher;
  const status = role === "teacher" ? lesson.status : enrollment?.status ?? lesson.status;
  const start = new Date(lesson.startTime);
  const started = start < new Date();

  return (
    <section className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h2 className="text-sm font-medium">{started ? "Happening now" : "Next lesson"}</h2>
        {!started && (
          <span className="text-sm tabular-nums text-muted-foreground">
            in {formatDistanceToNowStrict(start)}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border bg-background">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {format(start, "MMM")}
          </span>
          <span className="text-2xl font-semibold leading-none">{format(start, "d")}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-semibold">{lesson.skill.name}</h3>
            <StatusPill status={status} />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {friendlyDay(start)} · {timeRange(lesson.startTime, lesson.endTime)}
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <UserAvatar user={other} className="h-6 w-6" />
            <span>
              <span className="text-muted-foreground">{role === "teacher" ? "Teaching" : "With"}</span>{" "}
              {fullName(other)}
            </span>
          </div>
        </div>
        {role === "student" && (
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href={`/dashboard/teachers/${lesson.teacher.id}`}>View teacher</Link>
          </Button>
        )}
      </div>
    </section>
  );
}

function TeachersForYou({ me }) {
  const wanted = me?.studentProfile?.skills?.map((s) => s.skillId) ?? [];
  const { data } = useQuery(TEACHERS, {
    skip: !me,
    variables: {
      filters: wanted.length
        ? { teachingSkills: wanted.map((skillId) => ({ skillId, proficiency: 1 })) }
        : {},
      pagination: { limit: 5, offset: 0 },
    },
  });
  const teachers = (data?.publicTeacherUsers.users ?? [])
    .filter((u) => u.id !== me?.id)
    .slice(0, 4);

  return (
    <Section
      title={wanted.length ? "Teachers for you" : "Discover teachers"}
      href={teachers.length ? `/dashboard/teachers${wanted.length ? `?skills=${wanted.join(",")}` : ""}` : undefined}
      linkLabel="Browse all"
    >
      {data && !teachers.length ? (
        <FadeIn>
          <EmptyState
            icon={Users}
            title={wanted.length ? "No teachers for your skills yet" : "No teachers yet"}
            description="New teachers join all the time. Know something? Be one of the first."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/profile">Start teaching</Link>
              </Button>
            }
          />
        </FadeIn>
      ) : data ? (
        <FadeIn className="grid gap-4 sm:grid-cols-2">
          {teachers.map((u) => <TeacherCard key={u.id} user={u} />)}
        </FadeIn>
      ) : (
        <Loading className="grid gap-4 sm:grid-cols-2">
          <TeacherCardSkeleton />
          <TeacherCardSkeleton />
        </Loading>
      )}
    </Section>
  );
}

function DashboardPage() {
  const { me, loading: meLoading } = useMe();
  const greeting = useGreeting();
  const { data, loading } = useQuery(MY_LESSONS);
  const groups = groupLessons(data);
  const { action, upcoming } = groups;
  const lessonsLoading = loading && !data;
  const [next, ...later] = upcoming;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {!greeting || meLoading ? (
            <SkeletonText className="w-64 text-2xl" />
          ) : (
            <h1 className="text-2xl font-semibold tracking-tight animate-in fade-in">
              {greeting}
              {me?.firstName && `, ${me.firstName}`}
            </h1>
          )}
          {lessonsLoading ? (
            <SkeletonText className="mt-1 w-48 text-sm" />
          ) : (
            <p className="mt-1 text-sm text-muted-foreground animate-in fade-in">{summary(groups)}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/profile">
              <UserPen className="h-4 w-4" /> Profile
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard/teachers">
              <Search className="h-4 w-4" /> Find a teacher
            </Link>
          </Button>
        </div>
      </div>

      {action.length > 0 && (
        <Section title={`Needs your response (${action.length})`}>
          <div className="space-y-2">
            {action.map((i) => (
              <LessonCard key={i.lesson.id + i.role} {...i} />
            ))}
          </div>
        </Section>
      )}

      {lessonsLoading ? (
        <Loading>
          <div className="rounded-xl border bg-card">
            <div className="border-b px-5 py-3">
              <SkeletonText className="w-24 text-sm" />
            </div>
            <div className="flex items-center gap-4 p-5">
              <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
              <div className="flex-1">
                <SkeletonText className="w-40 text-lg" />
                <SkeletonText className="mt-0.5 w-48 text-sm" />
                <SkeletonText className="mt-2 w-32 text-sm leading-6" />
              </div>
            </div>
          </div>
        </Loading>
      ) : next ? (
        <FadeIn className="space-y-8">
          <NextLesson {...next} />
          {later.length > 0 && (
            <Section title="Later" href={later.length > 3 ? "/dashboard/lessons" : undefined}>
              <div className="space-y-2">
                {later.slice(0, 3).map((i) => (
                  <LessonCard key={i.lesson.id + i.role} {...i} />
                ))}
              </div>
            </Section>
          )}
        </FadeIn>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title="Nothing scheduled"
          description="Find someone to learn from, or wait for students to book you."
          action={
            <Button asChild>
              <Link href="/dashboard/teachers">
                <Search className="h-4 w-4" /> Find a teacher
              </Link>
            </Button>
          }
        />
      )}

      <TeachersForYou me={me} />
    </>
  );
}

export const Route = createFileRoute("/$locale/dashboard/")({ component: DashboardPage });
