"use client";

import { useQuery, gql } from "@apollo/client";
import { TeacherProfileEditForm } from "../../components/teacher-profile-edit-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, notFound } from "next/navigation";

// GraphQL query for teacher profile
const GET_TEACHER_PROFILE = gql`
  query GetTeacherProfile($id: PostgresID!) {
    teacherProfileById(id: $id) {
      id
      name
      bio
      skills {
        id
        proficiency
        skill {
          id
          name
        }
      }
      user {
        firstName
        lastName
      }
    }
  }
`;

export default function EditTeacherProfilePage() {
  const params = useParams();
  const profileId = params.id;

  // Use Apollo client-side query
  const { data, loading, error } = useQuery(GET_TEACHER_PROFILE, {
    variables: { id: profileId },
    fetchPolicy: "cache-and-network", // Use cache but also check network for updates
  });

  // Handle loading state
  if (loading && !data) {
    return (
      <div className="container p-2">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Teaching Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage the skills you can teach to others
          </p>
        </div>
        <FormSkeleton />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container p-2">
        <div className="p-6 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/10 dark:border-red-800/30">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
            Error loading profile
          </h2>
          <p className="text-red-600 dark:text-red-300">
            {error.message || "Please try refreshing the page."}
          </p>
        </div>
      </div>
    );
  }

  // Handle not found
  if (!data?.teacherProfileById) {
    notFound();
  }

  return (
    <div className="container p-2">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Teaching Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage the skills you can teach to others
        </p>
      </div>

      <TeacherProfileEditForm profile={data.teacherProfileById} />
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="grid gap-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}
