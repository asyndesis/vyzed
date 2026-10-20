import { createFileRoute } from "@tanstack/react-router";
import { TeacherBrowser } from "@/components/teacher-browser";

export const Route = createFileRoute("/$locale/dashboard/teachers/")({
  component: () => <TeacherBrowser basePath="/dashboard/teachers" />,
});
