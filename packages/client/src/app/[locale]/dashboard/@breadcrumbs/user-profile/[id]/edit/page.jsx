"use client";
import { BreadCrumbs } from "@/components/breadcrumbs";
import { useParams } from "next/navigation";

export default function Page() {
  const { id } = useParams();

  return (
    <BreadCrumbs
      overrides={{
        "user-profile": { hidden: true },
        [id]: {
          hidden: true,
        },
        edit: {
          label: "Edit User Profile",
          href: `/dashboard/user-profile/${id}/edit`,
        },
      }}
    />
  );
}
