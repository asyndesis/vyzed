"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { TeacherListFilters } from "./teacher-list-filters";

export function ClientFilterManager({ initialFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (filters) => {
    // Create a new URLSearchParams object
    const params = new URLSearchParams();

    // Preserve existing non-filter params
    for (const [key, value] of searchParams.entries()) {
      if (
        key !== "teaching" &&
        key !== "student" &&
        key !== "languages" &&
        key !== "offset"
      ) {
        params.set(key, value);
      }
    }

    // Update teaching skills param
    if (filters.teachingSkills?.length) {
      const teaching = filters.teachingSkills
        .map((skill) => `${skill.skillId}:${skill.proficiency}`)
        .join(",");
      params.set("teaching", teaching);
    }

    // Update student skills param
    if (filters.studentSkills?.length) {
      const student = filters.studentSkills
        .map((skill) => `${skill.skillId}:${skill.proficiency}`)
        .join(",");
      params.set("student", student);
    }

    // Update languages param
    if (filters.languages?.length) {
      const languages = filters.languages
        .map((skill) => `${skill.skillId}:${skill.proficiency}`)
        .join(",");
      params.set("languages", languages);
    }

    // Reset pagination when filters change
    params.set("offset", "0");

    // Update URL without full navigation
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <TeacherListFilters
      initialFilters={initialFilters}
      onFilterChange={handleFilterChange}
    />
  );
}
