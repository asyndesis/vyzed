import { createFileRoute } from "@tanstack/react-router";
import { TeacherProfile } from "@/components/teacher-profile";

export const Route = createFileRoute("/{-$locale}/dashboard/teachers/$id")({
  component: () => (
    <TeacherProfile id={Route.useParams().id} backTo="/{-$locale}/dashboard/teachers" />
  ),
});
