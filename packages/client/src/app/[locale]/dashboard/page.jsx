import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { Separator } from "@/components/ui/separator";
import { StudentProfileSection } from "./components/student-profile-section";
import { TeacherProfileSection } from "./components/teacher-profile-section";

export const metadata = {
  title: "Dashboard",
  description: "Manage your learning and teaching profiles",
};

// GraphQL query to fetch user profile data
const GET_USER_PROFILES = gql`
  query GetUserProfiles {
    me {
      id
      firstName
      lastInitial
      email
      studentProfile {
        id
        bio
      }
      teacherProfile {
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
      }
    }
  }
`;

export default async function DashboardPage() {
  // Server-side data fetching
  const { data } = await getClient().query({
    query: GET_USER_PROFILES,
  });

  const user = data?.me;
  const hasStudentProfile = !!user?.studentProfile;
  const hasTeacherProfile = !!user?.teacherProfile;

  return (
    <div className="container p-2 space-y-8">
      {/* Header - Improved spacing and responsiveness */}
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your learning and teaching profiles
        </p>
        <Separator className="mt-4" />
      </header>

      {/* Profiles Grid - Improved spacing and responsiveness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Student Profile Section */}
        <StudentProfileSection
          user={user}
          hasStudentProfile={hasStudentProfile}
        />

        {/* Teacher Profile Section */}
        <TeacherProfileSection
          user={user}
          hasTeacherProfile={hasTeacherProfile}
        />
      </div>
    </div>
  );
}
