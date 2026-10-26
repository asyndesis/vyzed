import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Languages,
  Loader2,
  Search,
  SearchX,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { LANGUAGE_SLUG } from "@/lib/skills";
import { FacetFilter } from "@/features/teachers/components/facet-filter";
import { EmptyState, PageTitle } from "@/components/page";
import {
  TeacherCard,
  TeacherCardFields,
} from "@/features/teachers/components/teacher-card";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Toggle } from "@/components/ui/toggle";
import { gqlQuery, graphql } from "@/lib/gql";
import { skillTreeQuery } from "@/lib/skill-queries";

const PAGE = 12;

// Filters live in the URL (?skills=a,b&swap=true) so results are shareable
export const teacherSearchSchema = z.object({
  q: z.string().optional(),
  skills: z.string().optional(),
  langs: z.string().optional(),
  swap: z.boolean().optional(),
  n: z.number().int().positive().optional(),
});
export type TeacherSearch = z.infer<typeof teacherSearchSchema>;

const ids = (csv?: string) => csv?.split(",").filter(Boolean) ?? [];

const TeacherList = graphql(
  `
    query TeacherList($filter: TeacherFilter, $limit: Int) {
      teachers(filter: $filter, limit: $limit) {
        id
        ...TeacherCardFields
      }
      teacherCount(filter: $filter)
    }
  `,
  [TeacherCardFields],
);

export const teacherListQuery = (s: TeacherSearch) =>
  gqlQuery(TeacherList, {
    limit: s.n ?? PAGE,
    filter: {
      search: s.q || null,
      skillIds: ids(s.skills),
      languageIds: ids(s.langs),
      swapOnly: s.swap ?? null,
    },
  });

// For route loaders: everything the browser needs, fetched in parallel
export const loadTeacherBrowser = (
  queryClient: import("@tanstack/react-query").QueryClient,
  search: TeacherSearch,
) =>
  Promise.all([
    queryClient.ensureQueryData(teacherListQuery(search)),
    queryClient.ensureQueryData(skillTreeQuery),
  ]);

export function TeacherBrowser({
  search,
  profileTo,
  title = "Find a teacher",
  description = "Learn from people near you, or trade lessons skill for skill.",
}: {
  search: TeacherSearch;
  profileTo: "/browse/$id" | "/dashboard/teachers/$id";
  title?: string;
  description?: string;
}) {
  const navigate = useNavigate();
  const loading = useRouterState({ select: (s) => s.isLoading });
  const { data } = useSuspenseQuery(teacherListQuery(search));
  const { data: tree } = useSuspenseQuery(skillTreeQuery);

  const setSearch = (patch: Partial<TeacherSearch>) =>
    navigate({
      to: ".",
      search: (prev: TeacherSearch) => {
        const next = { ...prev, ...patch };
        // Changing a filter starts over at the first page
        if (!("n" in patch)) delete next.n;
        return Object.fromEntries(
          Object.entries(next).filter(
            ([, v]) => v !== "" && v !== false && v != null,
          ),
        );
      },
      replace: true,
      resetScroll: false,
    });

  // Type freely; the URL (and the query) follow after a pause
  const [q, setQ] = useState(search.q ?? "");
  useEffect(() => {
    const t = setTimeout(() => {
      if (q.trim() !== (search.q ?? "")) setSearch({ q: q.trim() });
    }, 300);
    return () => clearTimeout(t);
    // oxlint-disable-next-line react/exhaustive-deps -- only react to typing
  }, [q]);

  const toOptions = (list: ReadonlyArray<{ id: string; name: string }>) =>
    list.map((s) => ({ value: s.id, label: s.name }));
  const skillGroups = tree.skills.map((c) => ({
    label: c.name,
    options: toOptions(c.children),
  }));
  const langGroups = [
    {
      options: toOptions(
        tree.skills.find((c) => c.slug === LANGUAGE_SLUG)?.children ?? [],
      ),
    },
  ];

  const filtered = !!(search.q || search.skills || search.langs || search.swap);
  const clearAll = () => {
    setQ("");
    navigate({ to: ".", search: {}, replace: true, resetScroll: false });
  };

  return (
    <>
      <PageTitle title={title} description={description} />

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full sm:w-56">
          <InputGroupInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search teachers…"
            aria-label="Search teachers"
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          {loading && (
            <InputGroupAddon align="inline-end">
              <Loader2 className="animate-spin" />
            </InputGroupAddon>
          )}
        </InputGroup>
        <FacetFilter
          title="Skill"
          groups={skillGroups}
          selected={ids(search.skills)}
          onChange={(v) => setSearch({ skills: v.join(",") })}
        />
        <FacetFilter
          title="Speaks"
          icon={Languages}
          groups={langGroups}
          selected={ids(search.langs)}
          onChange={(v) => setSearch({ langs: v.join(",") })}
        />
        <Toggle
          variant="outline"
          // Dashed until active, like the facet filters
          className="h-9 not-data-pressed:border-dashed not-data-pressed:shadow-none"
          pressed={!!search.swap}
          onPressedChange={(swap) => setSearch({ swap })}
        >
          <ArrowLeftRight /> Open to swaps
        </Toggle>
        {filtered && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-9">
            Reset <X />
          </Button>
        )}
      </div>

      {data.teachers.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No teachers match"
          description="Try removing a filter or searching for someone else."
          action={
            filtered && (
              <Button variant="outline" onClick={clearAll}>
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm tabular-nums text-muted-foreground">
            {data.teacherCount} teacher{data.teacherCount === 1 ? "" : "s"}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {data.teachers.map((t) => (
              <TeacherCard key={t.id} data={t} to={profileTo} />
            ))}
          </div>
          {data.teachers.length < data.teacherCount && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                disabled={loading}
                onClick={() => setSearch({ n: data.teachers.length + PAGE })}
              >
                {loading && <Loader2 className="animate-spin" />}
                Show more
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
