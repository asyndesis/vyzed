import { createFileRoute } from "@tanstack/react-router";
import { TeacherBrowser } from "@/components/teacher-browser";
import { TeachCallout } from "@/components/teach-callout";

export const Route = createFileRoute("/$locale/_home/browse/")({
  head: () => ({ meta: [{ title: "Browse teachers · Vyzed" }] }),
  component: () => (
    <>
      <TeacherBrowser
        basePath="/browse"
        title="Browse teachers"
        description="Book a lesson with someone local, or swap what you know for what you want to learn."
      />
      <TeachCallout />
    </>
  ),
});
