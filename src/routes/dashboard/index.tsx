import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ClientOnly,
  Link,
  createFileRoute,
  useHydrated,
} from "@tanstack/react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { GraduationCap, Search, UserPen, Users } from "lucide-react";
import { DateTile, LessonCard, StatusBadge } from "@/components/lesson-card";
import { EmptyState } from "@/components/page";
import { TeacherCard } from "@/components/teacher-card";
import { teacherListQuery } from "@/components/teacher-browser";
import { Button } from "@/components/ui/button";
import { SkeletonText } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { friendlyDay, fullName, timeRange } from "@/lib/format";
import {
  type LessonGroups,
  type LessonItem,
  useMyLessons,
} from "@/lib/lessons";
import { meQuery } from "@/lib/queries";

// Teachers for what I want to learn (one extra, in case I'm in the list)
const forYouQuery = (learns: string[]) =>
  teacherListQuery({ skills: learns.join(",") || undefined, n: 5 });

export const Route = createFileRoute("/dashboard/")({
  loader: async ({ context }) => {
    const { me } = await context.queryClient.ensureQueryData(meQuery);
    await context.queryClient.ensureQueryData(forYouQuery(learnsOf(me)));
  },
  head: () => ({ meta: [{ title: "Dashboard · Vyzed" }] }),
  component: DashboardPage,
});

const learnsOf = (
  me: { skills: ReadonlyArray<{ kind: string; skillId: string }> } | null,
) => me?.skills.filter((s) => s.kind === "learns").map((s) => s.skillId) ?? [];

// Time of day only exists in the browser: null until hydrated keeps SSR in sync
function useGreeting() {
  const hydrated = useHydrated();
  return hydrated ? currentGreeting() : null;
}

const currentGreeting = (h = new Date().getHours()) =>
  h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function summary({ action, upcoming }: LessonGroups) {
  if (action.length)
    return `${plural(action.length, "lesson")} waiting on you.`;
  if (upcoming.length) return `${plural(upcoming.length, "lesson")} coming up.`;
  return "Your calendar is clear. A good time to learn something new.";
}

function Section({
  title,
  link,
  children,
}: {
  title: string;
  link?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">{title}</h2>
        {link}
      </div>
      {children}
    </section>
  );
}

function NextLesson({ item, now }: { item: LessonItem; now: number }) {
  const { lesson, role, status, other } = item;
  const started = new Date(lesson.startTime).getTime() <= now;

  return (
    <section className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <h2 className="text-sm font-medium">
          {started ? "Happening now" : "Next lesson"}
        </h2>
        {!started && (
          <ClientOnly fallback={<SkeletonText className="w-16 text-sm" />}>
            <span className="text-sm text-muted-foreground tabular-nums">
              in {formatDistanceToNowStrict(new Date(lesson.startTime))}
            </span>
          </ClientOnly>
        )}
      </div>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <DateTile date={lesson.startTime} className="size-16" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-semibold">
              {lesson.skill.name}
            </h3>
            <StatusBadge status={status} />
          </div>
          <ClientOnly
            fallback={<SkeletonText className="mt-0.5 w-48 text-sm" />}
          >
            <p className="mt-0.5 text-sm text-muted-foreground">
              {friendlyDay(lesson.startTime)} ·{" "}
              {timeRange(lesson.startTime, lesson.endTime)}
            </p>
          </ClientOnly>
          <div className="mt-2 flex items-center gap-2 text-sm">
            {other && <UserAvatar user={other} className="size-6" />}
            <span>
              <span className="text-muted-foreground">
                {role === "teacher" ? "Teaching" : "With"}
              </span>{" "}
              {fullName(other)}
            </span>
          </div>
        </div>
        {role === "student" && (
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link
              to="/dashboard/teachers/$id"
              params={{ id: lesson.teacher.id }}
            >
              View teacher
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}

function TeachersForYou() {
  const { data: meData } = useSuspenseQuery(meQuery);
  const me = meData.me;
  const learns = learnsOf(me);
  const { data } = useSuspenseQuery(forYouQuery(learns));
  const teachers = data.teachers.filter((t) => t.id !== me?.id).slice(0, 4);

  return (
    <Section
      title={learns.length ? "Teachers for you" : "Discover teachers"}
      link={
        teachers.length > 0 && (
          <Link
            to="/dashboard/teachers"
            search={learns.length ? { skills: learns.join(",") } : {}}
            className="text-sm text-primary hover:underline"
          >
            Browse all
          </Link>
        )
      }
    >
      {teachers.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {teachers.map((t) => (
            <TeacherCard key={t.id} data={t} to="/dashboard/teachers/$id" />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title={
            learns.length
              ? "No teachers for your skills yet"
              : "No teachers yet"
          }
          description="New teachers join all the time. Know something? Be one of the first."
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard/profile">Start teaching</Link>
            </Button>
          }
        />
      )}
    </Section>
  );
}

function DashboardPage() {
  const greeting = useGreeting();
  const { data } = useSuspenseQuery(meQuery);
  const { groups, now } = useMyLessons();
  const [next, ...later] = groups.upcoming;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {greeting ? (
            <h1 className="text-2xl font-semibold tracking-tight">
              {greeting}
              {data.me?.firstName && `, ${data.me.firstName}`}
            </h1>
          ) : (
            <SkeletonText className="w-64 text-2xl" />
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            {summary(groups)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/profile">
              <UserPen /> Profile
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/dashboard/teachers">
              <Search /> Find a teacher
            </Link>
          </Button>
        </div>
      </div>

      {groups.action.length > 0 && (
        <Section title={`Needs your response (${groups.action.length})`}>
          <div className="space-y-2">
            {groups.action.map((item) => (
              <LessonCard key={item.lesson.id} item={item} />
            ))}
          </div>
        </Section>
      )}

      {next ? (
        <>
          <NextLesson item={next} now={now} />
          {later.length > 0 && (
            <Section
              title="Later"
              link={
                later.length > 3 && (
                  <Link
                    to="/dashboard/lessons"
                    className="text-sm text-primary hover:underline"
                  >
                    See all
                  </Link>
                )
              }
            >
              <div className="space-y-2">
                {later.slice(0, 3).map((item) => (
                  <LessonCard key={item.lesson.id} item={item} />
                ))}
              </div>
            </Section>
          )}
        </>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title="Nothing scheduled"
          description="Find someone to learn from, or wait for students to book you."
          action={
            <Button asChild>
              <Link to="/dashboard/teachers">
                <Search /> Find a teacher
              </Link>
            </Button>
          }
        />
      )}

      <TeachersForYou />
    </>
  );
}
