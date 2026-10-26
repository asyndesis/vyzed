import { createFileRoute } from "@tanstack/react-router";
import {
  TeacherProfile,
  loadTeacherProfile,
} from "@/components/teacher-profile";
import { fullName } from "@/lib/format";

export const Route = createFileRoute("/dashboard/teachers/$id")({
  loader: ({ context, params }) =>
    loadTeacherProfile(context.queryClient, params.id),
  head: ({ loaderData }) => ({
    meta: [{ title: `${fullName(loaderData?.user)} · Vyzed` }],
  }),
  component: () => (
    <TeacherProfile id={Route.useParams().id} backTo="/dashboard/teachers" />
  ),
});
