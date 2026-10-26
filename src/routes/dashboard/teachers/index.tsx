import { createFileRoute } from "@tanstack/react-router";
import {
  TeacherBrowser,
  loadTeacherBrowser,
  teacherSearchSchema,
} from "@/features/teachers/teacher-browser";

export const Route = createFileRoute("/dashboard/teachers/")({
  validateSearch: teacherSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => loadTeacherBrowser(context.queryClient, deps),
  head: () => ({ meta: [{ title: "Find a teacher · Vyzed" }] }),
  component: () => (
    <TeacherBrowser
      search={Route.useSearch()}
      profileTo="/dashboard/teachers/$id"
    />
  ),
});
