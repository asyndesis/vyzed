import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { StudentProfileEditForm } from "../../components/student-profile-edit-form";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Student Profile",
  description: "Manage your learning journey",
};

// GraphQL query for student profile
const GET_STUDENT_PROFILE = gql`
  query GetStudentProfile($id: PostgresID!) {
    studentProfileById(id: $id) {
      id
      skills {
        id
        proficiency
        skill {
          id
          name
          framework
        }
      }
    }
  }
`;

export default async function EditStudentProfilePage({ params }) {
  const { id: profileId } = params;

  // Server-side data fetching
  const { data, error } = await getClient().query({
    query: GET_STUDENT_PROFILE,
    variables: { id: profileId },
  });

  // Handle error state
  if (error) {
    console.error("Error fetching student profile:", error);
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
  if (!data?.studentProfileById) {
    notFound();
  }

  return (
    <div className="container p-2">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Student Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage the skills you want to learn and improve
        </p>
      </div>

      <StudentProfileEditForm profile={data.studentProfileById} />
    </div>
  );
}
