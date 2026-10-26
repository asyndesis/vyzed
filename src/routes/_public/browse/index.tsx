import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/public-shell";
import { TeachCallout } from "@/features/teachers/components/teach-callout";
import {
  TeacherBrowser,
  loadTeacherBrowser,
  teacherSearchSchema,
} from "@/features/teachers/components/teacher-browser";

export const Route = createFileRoute("/_public/browse/")({
  validateSearch: teacherSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => loadTeacherBrowser(context.queryClient, deps),
  head: () => ({ meta: [{ title: "Browse teachers · Vyzed" }] }),
  component: () => (
    <PublicPage>
      <TeacherBrowser
        search={Route.useSearch()}
        profileTo="/browse/$id"
        title="Browse teachers"
        description="Book a lesson with someone local, or swap what you know for what you want to learn."
      />
      <TeachCallout />
    </PublicPage>
  ),
});
