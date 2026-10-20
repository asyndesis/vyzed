import { createFileRoute } from "@tanstack/react-router";
import { TeacherBrowser, validateTeacherSearch } from "@/components/teacher-browser";

export const Route = createFileRoute("/{-$locale}/dashboard/teachers/")({
  validateSearch: validateTeacherSearch,
  component: () => <TeacherBrowser profileTo="/{-$locale}/dashboard/teachers/$id" />,
});
