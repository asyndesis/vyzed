import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useQuery } from "@apollo/client/react";
import { ArrowLeftRight, Languages, Loader2, Search, SearchX, X } from "lucide-react";
import { ROOT_SKILLS, TEACHERS } from "@/lib/graphql";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { FacetFilter } from "@/components/facet-filter";
import { EmptyState, Loading, PageTitle } from "@/components/empty-state";
import { TeacherCard, TeacherCardSkeleton } from "@/components/teacher-card";

const PAGE = 12;

const text = (v) => (v == null || v === "" ? undefined : String(v));

// validateSearch for both teacher list routes. Lists stay comma-separated in
// the URL (?skills=a,b) so links read cleanly.
export const validateTeacherSearch = (search) => ({
  q: text(search.q),
  skills: text(search.skills),
  langs: text(search.langs),
  swap: search.swap === true || undefined,
});

function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function Teachers({ profileTo, title, description }) {
  const navigate = useNavigate();
  const params = useSearch({ strict: false });

  // Filters live in the URL so results are shareable and survive back/forward
  const list = (k) => params[k]?.split(",").filter(Boolean) ?? [];
  const skillIds = list("skills");
  const langIds = list("langs");
  const swap = !!params.swap;
  const [q, setQ] = useState(params.q ?? "");
  const search = useDebounced(q.trim());
  const [limit, setLimit] = useState(PAGE);

  const setParams = (patch) =>
    navigate({
      to: ".",
      search: (prev) => validateTeacherSearch({ ...prev, ...patch }),
      replace: true,
      resetScroll: false,
    });

  useEffect(() => {
    if (search !== (params.q ?? "")) setParams({ q: search });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Reset paging whenever the filters change
  useEffect(() => setLimit(PAGE), [search, swap, params.skills, params.langs]);

  const { data: skillData } = useQuery(ROOT_SKILLS);
  const categories = skillData?.rootSkills ?? [];
  const toOptions = (skills) => skills.map((c) => ({ value: c.id, label: c.name }));
  const skillGroups = categories.map((c) => ({ label: c.name, options: toOptions(c.children) }));
  const langGroups = [
    { options: toOptions(categories.find((c) => c.name === "Language")?.children ?? []) },
  ];

  const anyOf = (ids) => ids.map((skillId) => ({ skillId, proficiency: 1 }));
  const filters = {
    ...(search && { search }),
    ...(swap && { allowBarter: true }),
    ...(skillIds.length && { teachingSkills: anyOf(skillIds) }),
    ...(langIds.length && { languages: anyOf(langIds) }),
  };

  const { data, previousData, loading, error } = useQuery(TEACHERS, {
    variables: { filters, pagination: { limit, offset: 0 } },
  });
  // Keep showing the last results while new ones load, so the list doesn't flash
  const result = (data ?? previousData)?.publicTeacherUsers;
  const teachers = result?.users ?? [];

  const hasFilters = !!(search || swap || skillIds.length || langIds.length);
  const clearAll = () => {
    setQ("");
    navigate({ to: ".", search: {}, replace: true, resetScroll: false });
  };

  return (
    <>
      <PageTitle title={title} description={description} />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search teachers…"
          wrapperClassName="w-full sm:w-56"
          iconLeft={<Search className="h-4 w-4" />}
          iconRight={loading && result && <Loader2 className="h-4 w-4 animate-spin" />}
        />
        <FacetFilter
          title="Skill"
          groups={skillGroups}
          selected={skillIds}
          onChange={(v) => setParams({ skills: v.join(",") })}
        />
        <FacetFilter
          title="Speaks"
          icon={Languages}
          groups={langGroups}
          selected={langIds}
          onChange={(v) => setParams({ langs: v.join(",") })}
        />
        <Toggle
          variant="filter"
          pressed={swap}
          onPressedChange={(on) => setParams({ swap: on })}
        >
          <ArrowLeftRight /> Open to swaps
        </Toggle>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-9 text-muted-foreground">
            Reset <X />
          </Button>
        )}
      </div>

      {error && !result ? (
        <EmptyState icon={SearchX} title="Couldn't load teachers" description={error.message} />
      ) : !result ? (
        <Loading className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => <TeacherCardSkeleton key={i} />)}
        </Loading>
      ) : teachers.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No teachers match"
          description="Try removing a filter or searching for someone else."
          action={hasFilters && <Button variant="outline" onClick={clearAll}>Clear filters</Button>}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm tabular-nums text-muted-foreground">
            {result.pagination.total} teacher{result.pagination.total === 1 ? "" : "s"}
          </p>
          <div
            className={cn(
              "grid gap-4 transition-opacity animate-in fade-in duration-300 sm:grid-cols-2",
              loading && limit === PAGE && "opacity-60",
            )}
          >
            {teachers.map((u) => (
              <TeacherCard key={u.id} user={u} to={profileTo} />
            ))}
          </div>
          {result.pagination.hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                disabled={loading}
                onClick={() => setLimit((l) => l + PAGE)}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Show more
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Shared by the public /browse page and the signed-in /dashboard/teachers page
export function TeacherBrowser({
  profileTo,
  title = "Find a teacher",
  description = "Learn from people near you, or trade lessons skill for skill.",
}) {
  return (
    <Suspense>
      <Teachers profileTo={profileTo} title={title} description={description} />
    </Suspense>
  );
}
