import { createFileRoute, notFound } from "@tanstack/react-router";
import { Badge } from "@vyzed/ui/components/badge";
import { BookingPanel } from "~/components/booking-panel";
import { ApiError, api, call } from "~/lib/api";
import { formatPrice } from "~/lib/format";

export const Route = createFileRoute("/teachers/$teacherId")({
  loader: async ({ params }) => {
    try {
      return await call(api.teachers[":id"].$get({ param: { id: params.teacherId } }));
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 400)) throw notFound();
      throw err;
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.teacher.displayName} · Vyzed` },
          { name: "description", content: loaderData.teacher.headline },
          { property: "og:title", content: loaderData.teacher.displayName },
          { property: "og:description", content: loaderData.teacher.headline },
        ]
      : [],
  }),
  component: TeacherPage,
});

function TeacherPage() {
  const { teacher } = Route.useLoaderData();

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_420px]">
      <article className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">{teacher.displayName}</h1>
        {teacher.headline && <p className="text-lg text-muted-foreground">{teacher.headline}</p>}
        <div className="flex flex-wrap gap-1">
          {teacher.subjects.map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
          {teacher.languages.map((l) => (
            <Badge key={l} variant="outline">
              Speaks {l}
            </Badge>
          ))}
        </div>
        <p className="font-medium">
          {formatPrice(teacher.hourlyRateCents, teacher.currency)} / hour
        </p>
        <p className="whitespace-pre-line leading-relaxed">{teacher.bio}</p>
      </article>
      <aside>
        <BookingPanel teacher={teacher} />
      </aside>
    </div>
  );
}
