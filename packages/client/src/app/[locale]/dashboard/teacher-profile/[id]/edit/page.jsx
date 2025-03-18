import { getClient } from "@/lib/apollo-client"; // You'll need to create this
import { gql } from "@apollo/client";
import { TeacherProfileEditForm } from "../../components/teacher-profile-edit-form";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Teacher Profile",
  description: "Manage your learning and teaching profiles",
};

// GraphQL query for teacher profile
const GET_TEACHER_PROFILE = gql`
  query GetTeacherProfile($id: PostgresID!) {
    teacherProfileById(id: $id) {
      id
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
        lastInitial
      }
    }
  }
`;

export default async function EditTeacherProfilePage({ params }) {
  const { id: profileId } = await params;

  // Server-side data fetching
  const { data, error } = await getClient().query({
    query: GET_TEACHER_PROFILE,
    variables: { id: profileId },
  });

  // Handle error state
  if (error) {
    console.error("Error fetching teacher profile:", error);
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
