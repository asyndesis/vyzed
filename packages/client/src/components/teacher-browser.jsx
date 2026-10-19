"use client";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
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

function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function Teachers({ basePath, title, description }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Filters live in the URL so results are shareable and survive back/forward
  const list = (k) => params.get(k)?.split(",").filter(Boolean) ?? [];
  const skillIds = list("skills");
  const langIds = list("langs");
  const swap = params.get("swap") === "1";
  const [q, setQ] = useState(params.get("q") ?? "");
  const search = useDebounced(q.trim());
  const [limit, setLimit] = useState(PAGE);

  const setParams = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    router.replace(`${pathname}?${next}`, { scroll: false });
  };

  useEffect(() => {
    if (search !== (params.get("q") ?? "")) setParams({ q: search });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Reset paging whenever the filters change
  useEffect(() => setLimit(PAGE), [search, swap, params.get("skills"), params.get("langs")]);

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
    router.replace(pathname, { scroll: false });
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
          onPressedChange={(on) => setParams({ swap: on ? "1" : "" })}
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
        <>
          <p className="-mb-4 text-sm tabular-nums text-muted-foreground">
            {result.pagination.total} teacher{result.pagination.total === 1 ? "" : "s"}
          </p>
          <div
            className={cn(
              "grid gap-4 transition-opacity animate-in fade-in duration-300 sm:grid-cols-2",
              loading && limit === PAGE && "opacity-60",
            )}
          >
            {teachers.map((u) => (
              <TeacherCard key={u.id} user={u} href={`${basePath}/${u.id}`} />
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
        </>
      )}
    </>
  );
}

// Shared by the public /browse page and the signed-in /dashboard/teachers page
export function TeacherBrowser({
  basePath,
  title = "Find a teacher",
  description = "Learn from people near you, or trade lessons skill for skill.",
}) {
  // useSearchParams needs a Suspense boundary in the app router
  return (
    <Suspense>
      <Teachers basePath={basePath} title={title} description={description} />
    </Suspense>
  );
}
