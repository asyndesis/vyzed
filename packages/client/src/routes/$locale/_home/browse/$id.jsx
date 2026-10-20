import { createFileRoute } from "@tanstack/react-router";
import { TeacherProfile } from "@/components/teacher-profile";

export const Route = createFileRoute("/$locale/_home/browse/$id")({
  component: () => <TeacherProfile id={Route.useParams().id} basePath="/browse" />,
});
