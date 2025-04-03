import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { StudentProfileSection } from "./components/student-profile-section";
import { TeacherProfileSection } from "./components/teacher-profile-section";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
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

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Manage your learning and teaching profiles"
      />
      {/* Main Layout - Using flex instead of grid for better control */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Role Profiles - Takes full width, stacked vertically */}
        <div className="w-full space-y-6">
          {/* User Profile Section */}
          <UserProfileSection user={user} />
          {/* Student Profile Section */}
          <StudentProfileSection user={user} />
          {/* Teacher Profile Section */}
          <TeacherProfileSection user={user} />
        </div>
      </div>
    </>
  );
}
