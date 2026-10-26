import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarDays, History, Inbox } from "lucide-react";
import { useState } from "react";
import { LessonCard } from "@/components/lesson-card";
import { EmptyState, PageTitle } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { type LessonGroups, useMyLessons } from "@/lib/lessons";

const TABS = [
  {
    key: "action",
    label: "Needs action",
    empty: {
      icon: Inbox,
      title: "You're all caught up",
      description: "New lesson requests will show up here.",
    },
  },
  {
    key: "upcoming",
    label: "Upcoming",
    empty: {
      icon: CalendarDays,
      title: "No upcoming lessons",
      description: "Book a teacher to get something on the calendar.",
    },
  },
  {
    key: "past",
    label: "Past",
    empty: {
      icon: History,
      title: "No history yet",
      description: "Finished and cancelled lessons will appear here.",
    },
  },
] as const;

type Role = "all" | "teacher" | "student";

export const Route = createFileRoute("/dashboard/lessons")({
  head: () => ({ meta: [{ title: "Lessons · Vyzed" }] }),
  component: LessonsPage,
});

function LessonsPage() {
  const { groups } = useMyLessons();
  const [role, setRole] = useState<Role>("all");
  // Until a tab is picked, open "Needs action" if anything is waiting
  const [tab, setTab] = useState<string | null>(null);
  const filter = (key: keyof LessonGroups) =>
    role === "all" ? groups[key] : groups[key].filter((i) => i.role === role);

  return (
    <>
      <PageTitle
        title="Lessons"
        description="Everything you're teaching and learning."
        actions={
          <ToggleGroup
            variant="outline"
            size="sm"
            value={[role]}
            onValueChange={([v]) => v && setRole(v as Role)}
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="teacher">Teaching</ToggleGroupItem>
            <ToggleGroupItem value="student">Learning</ToggleGroupItem>
          </ToggleGroup>
        }
      />

      <Tabs
        value={tab ?? (groups.action.length ? "action" : "upcoming")}
        onValueChange={setTab}
      >
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="gap-1.5">
              {t.label}
              <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums">
                {filter(t.key).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((t) => {
          const list = filter(t.key);
          return (
            <TabsContent key={t.key} value={t.key} className="mt-4 space-y-2">
              {list.length ? (
                list.map((item) => (
                  <LessonCard key={item.lesson.id} item={item} />
                ))
              ) : (
                <EmptyState
                  {...t.empty}
                  action={
                    t.key === "upcoming" && (
                      <Button
                        variant="outline"
                        render={<Link to="/dashboard/teachers" />}
                        nativeButton={false}
                      >
                        Find a teacher
                      </Button>
                    )
                  }
                />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </>
  );
}
