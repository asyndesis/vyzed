"use client";
import { BreadCrumbs } from "@/components/breadcrumbs";
import { useParams } from "next/navigation";

export default function Page() {
  const { id } = useParams();

  return (
    <BreadCrumbs
      overrides={{
        [id]: {
          label: "Current Teacher",
          href: `/dashboard/teacher-profile/${id}/edit`,
        },
      }}
    />
  );
}
