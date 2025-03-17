import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { NavUserDropdown } from "./nav-user-dropdown";

const meQuery = gql`
  query me {
    me {
      id
      firstName
      lastName
      imageUrl
      email
    }
  }
`;

export async function NavUser() {
  // Server-side data fetching
  const { data, error } = await getClient().query({
    query: meQuery,
  });

  const user = data?.me;

  if (error) {
    console.error("Error fetching user data:", error);
    return <NavUserSkeleton />;
  }

  if (!user) {
    return <NavUserSkeleton />;
  }

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  // Pass the user data to the client component
  return <NavUserDropdown user={user} fullName={fullName} />;
}

// Skeleton loader component (can be server component)
function NavUserSkeleton() {
  return (
    <div className="flex items-center gap-2 p-2">
      <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
      </div>
    </div>
  );
}
