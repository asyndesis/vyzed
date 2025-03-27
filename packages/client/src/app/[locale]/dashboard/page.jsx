import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { StudentProfileSection } from "./components/student-profile-section";
import { TeacherProfileSection } from "./components/teacher-profile-section";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
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

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Manage your learning and teaching profiles"
        controls={
          <Link href="/dashboard/user-profile">
            <Button variant="outline" className="gap-2">
              <UserCircle className="h-4 w-4" />
              User Profile
            </Button>
          </Link>
        }
      />
      {/* Main Layout - Using flex instead of grid for better control */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Role Profiles - Takes full width, stacked vertically */}
        <div className="w-full space-y-6">
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
    </>
  );
}
