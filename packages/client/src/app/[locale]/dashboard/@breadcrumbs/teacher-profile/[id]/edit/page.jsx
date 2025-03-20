"use client";
import { BreadCrumbs } from "@/components/breadcrumbs";
import { useParams } from "next/navigation";

export default function Page() {
  const { id } = useParams();

  return (
    <BreadCrumbs
      overrides={{
        "teacher-profile": { hidden: true },
        [id]: {
          hidden: true,
        },
        edit: {
          label: "Edit Teacher Profile",
          href: `/dashboard/teacher-profile/${id}/edit`,
        },
      }}
    />
  );
}
