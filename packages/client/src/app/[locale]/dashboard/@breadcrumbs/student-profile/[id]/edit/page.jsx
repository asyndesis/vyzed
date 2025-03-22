"use client";
import { BreadCrumbs } from "@/components/breadcrumbs";
import { useParams } from "next/navigation";

export default function Page() {
  const { id } = useParams();

  return (
    <BreadCrumbs
      overrides={{
        "student-profile": { hidden: true },
        [id]: {
          hidden: true,
        },
        edit: {
          label: "Edit Student Profile",
          href: `/dashboard/student-profile/${id}/edit`,
        },
      }}
    />
  );
}
