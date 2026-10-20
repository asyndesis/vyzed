import { createFileRoute } from "@tanstack/react-router";
import { TeacherBrowser, validateTeacherSearch } from "@/components/teacher-browser";
import { TeachCallout } from "@/components/teach-callout";

export const Route = createFileRoute("/{-$locale}/_home/browse/")({
  validateSearch: validateTeacherSearch,
  head: () => ({ meta: [{ title: "Browse teachers · Vyzed" }] }),
  component: () => (
    <>
      <TeacherBrowser
        profileTo="/{-$locale}/browse/$id"
        title="Browse teachers"
        description="Book a lesson with someone local, or swap what you know for what you want to learn."
      />
      <TeachCallout />
    </>
  ),
});
