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
    const filterKeys = [
      "teaching",
      "student",
      "languages",
      "allowBarter",
      "offset",
    ];
    for (const [key, value] of searchParams.entries()) {
      if (!filterKeys.includes(key)) {
        params.set(key, value);
      }
    }

    // Add filter params if they exist
    if (filters.teachingSkills?.length) {
      params.set(
        "teaching",
        filters.teachingSkills
          .map((skill) => `${skill.skillId}:${skill.proficiency}`)
          .join(",")
      );
    }

    if (filters.studentSkills?.length) {
      params.set(
        "student",
        filters.studentSkills
          .map((skill) => `${skill.skillId}:${skill.proficiency}`)
          .join(",")
      );
    }

    if (filters.languages?.length) {
      params.set(
        "languages",
        filters.languages
          .map((skill) => `${skill.skillId}:${skill.proficiency}`)
          .join(",")
      );
    }

    if (filters.allowBarter) {
      params.set("allowBarter", "true");
    }

    // Reset pagination when filters change
    params.delete("offset");

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
