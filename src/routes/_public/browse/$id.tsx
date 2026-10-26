import { createFileRoute } from "@tanstack/react-router";
import { PublicPage } from "@/components/public-shell";
import {
  TeacherProfile,
  loadTeacherProfile,
} from "@/components/teacher-profile";
import { fullName } from "@/lib/format";

export const Route = createFileRoute("/_public/browse/$id")({
  loader: ({ context, params }) =>
    loadTeacherProfile(context.queryClient, params.id),
  head: ({ loaderData }) => ({
    meta: [{ title: `${fullName(loaderData?.user)} · Vyzed` }],
  }),
  component: () => (
    <PublicPage>
      <TeacherProfile id={Route.useParams().id} backTo="/browse" />
    </PublicPage>
  ),
});
