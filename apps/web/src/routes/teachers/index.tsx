import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Badge } from "@vyzed/ui/components/badge";
import { Button } from "@vyzed/ui/components/button";
import { Input } from "@vyzed/ui/components/input";
import { z } from "zod";
import { api, call } from "~/lib/api";
import { formatPrice } from "~/lib/format";

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  subject: z.string().optional().catch(undefined),
  page: z.number().int().min(1).optional().catch(undefined),
});

export const Route = createFileRoute("/teachers/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps: { q, subject, page } }) =>
    call(
      api.teachers.$get({
        query: { q: q || undefined, subject, page: page ? String(page) : undefined },
      }),
    ),
  head: () => ({
    meta: [
      { title: "Find a teacher · Vyzed" },
      { name: "description", content: "Browse teachers by subject, language and price." },
    ],
  }),
  component: Teachers,
});

function Teachers() {
  const { teachers, total, page, pageSize } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Find a teacher</h1>
      <form
        className="mb-8 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get("q");
          const query = typeof q === "string" ? q.trim() : "";
          void navigate({ search: { q: query || undefined } });
        }}
      >
        <Input name="q" placeholder="Subject, language or name…" defaultValue={search.q ?? ""} />
        <Button type="submit">Search</Button>
      </form>

      {teachers.length === 0 ? (
        <p className="text-muted-foreground">No teachers found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t) => (
            <Link
              key={t.id}
              to="/teachers/$teacherId"
              params={{ teacherId: t.id }}
              className="flex flex-col gap-3 rounded-xl border p-5 transition hover:border-foreground"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-semibold">{t.displayName}</h2>
                <span className="text-sm font-medium">
                  {formatPrice(t.hourlyRateCents, t.currency)}/h
                </span>
              </div>
              {t.headline && <p className="text-sm text-muted-foreground">{t.headline}</p>}
              <div className="flex flex-wrap gap-1">
                {t.subjects.map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4 text-sm">
          {page > 1 && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/teachers" search={{ ...search, page: page - 1 }}>
                Previous
              </Link>
            </Button>
          )}
          <span>
            Page {page} of {pages}
          </span>
          {page < pages && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/teachers" search={{ ...search, page: page + 1 }}>
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
