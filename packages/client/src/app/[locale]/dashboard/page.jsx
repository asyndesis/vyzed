import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { Separator } from "@/components/ui/separator";
import { StudentProfileSection } from "./components/student-profile-section";
import { TeacherProfileSection } from "./components/teacher-profile-section";
import { UserProfileSection } from "./components/user-profile-section";

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
      lastName
      lastInitial
      email
      userProfile {
        id
        bio
        languages {
          id
          skillId
          proficiency
          skill {
            id
            name
            framework
          }
        }
      }
      studentProfile {
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
      teacherProfile {
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
  const hasUserProfile = !!user?.userProfile;

  console.log(user);

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
      </header>
      <Separator />

      {/* Main Layout - Using flex instead of grid for better control */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* User Profile - Takes more space */}
        <div className="xl:w-1/2">
          <UserProfileSection user={user} hasUserProfile={hasUserProfile} />
        </div>

        {/* Role Profiles - Takes less space, stacked vertically */}
        <div className="xl:w-1/2 space-y-6">
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
    </div>
  );
}
