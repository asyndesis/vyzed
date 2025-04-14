import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { PageHeader } from "@/components/page-header";
import { DashboardProfileCards } from "./components/dashboard-profile-cards";
import { MyLessons } from "./components/my-lessons";

export const metadata = {
  title: "Dashboard",
  description: "Your dashboard",
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
      {/* Main Layout with sidebar */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main content area */}
        <div className="w-full min-w-0">
          {/* Your main dashboard content goes here */}
          <MyLessons />
        </div>
        {/* Sidebar with simple profile cards */}
        <div className="w-full md:w-72 space-y-4">
          <DashboardProfileCards user={user} />
        </div>
      </div>
    </>
  );
}
