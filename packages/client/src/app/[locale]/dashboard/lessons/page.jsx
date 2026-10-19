"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { CalendarDays, Inbox, History } from "lucide-react";
import { MY_LESSONS } from "@/lib/graphql";
import { groupLessons } from "@/lib/lessons";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EmptyState, FadeIn, Loading, PageTitle } from "@/components/empty-state";
import { LessonCard, LessonCardSkeleton } from "@/components/lesson-card";

const EMPTY = {
  action: { icon: Inbox, title: "You're all caught up", description: "New lesson requests will show up here." },
  upcoming: { icon: CalendarDays, title: "No upcoming lessons", description: "Book a teacher to get something on the calendar." },
  past: { icon: History, title: "No history yet", description: "Finished and cancelled lessons will appear here." },
};

export default function LessonsPage() {
  const { data, loading } = useQuery(MY_LESSONS);
  const [role, setRole] = useState("all");
  // Until the user picks a tab, open Requests if anything needs a response
  const [tab, setTab] = useState(null);
  const groups = groupLessons(data);
  const filter = (list) => (role === "all" ? list : list.filter((i) => i.role === role));

  const tabs = [
    { key: "action", label: "Requests" },
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
  ];

  return (
    <>
      <PageTitle
        title="Lessons"
        description="Everything you're teaching and learning."
        actions={
          <ToggleGroup
            type="single"
            value={role}
            onValueChange={(v) => v && setRole(v)}
            variant="outline"
            size="sm"
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
          {tabs.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="gap-1.5">
              {t.label}
              {data && filter(groups[t.key]).length > 0 && (
                <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
                  {filter(groups[t.key]).length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((t) => {
          const list = filter(groups[t.key]);
          return (
            <TabsContent key={t.key} value={t.key} className="mt-4 space-y-2">
              {loading && !data ? (
                <Loading className="space-y-2">
                  {[0, 1, 2].map((i) => <LessonCardSkeleton key={i} />)}
                </Loading>
              ) : list.length ? (
                <FadeIn className="space-y-2">
                  {list.map((i) => <LessonCard key={i.lesson.id + i.role} {...i} />)}
                </FadeIn>
              ) : (
                <EmptyState
                  {...EMPTY[t.key]}
                  action={
                    t.key === "upcoming" && (
                      <Button asChild variant="outline">
                        <Link href="/dashboard/teachers">Find a teacher</Link>
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
