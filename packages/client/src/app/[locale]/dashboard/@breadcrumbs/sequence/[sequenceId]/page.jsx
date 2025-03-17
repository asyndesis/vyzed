"use client";
import { BreadCrumbs } from "@/components/breadcrumbs";
import { gql, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";

const teacherProfileQuery = gql`
  query TeacherProfile($id: PostgresID!) {
    teacherProfileById(id: $id) {
      id
      user {
        firstName
        lastName
      }
    }
  }
`;

export default function Page() {
  const { id } = useParams();

  const { data, loading } = useQuery(teacherProfileQuery, {
    variables: {
      id,
    },
  });

  const profile = data?.teacherProfileById;
  const teacherName = profile?.user
    ? `${profile.user.firstName} ${profile.user.lastName}'s Profile`
    : "Teacher Profile";

  return (
    <BreadCrumbs
      isLoading={loading}
      overrides={{
        "teacher-profile": { href: "/dashboard", label: "Teacher Profiles" },
        [id]: { label: teacherName },
      }}
    />
  );
}
