import { gql } from "@apollo/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getClient } from "@/lib/apollo-client";
import UserSkillBadge from "@/components/user-skill-badge";
import { convert } from "html-to-text";
import Link from "next/link";

export const metadata = {
  title: "Teachers",
  description: "Find a teacher for your child",
};

// Updated GraphQL query to include userProfile.bio
const GET_TEACHERS = gql`
  query GetPublicUsers {
    publicUsers {
      id
      firstName
      lastInitial
      imageUrl
      userProfile {
        id
        bio
      }
      teacherProfile {
        id
        skills {
          id
          skill {
            id
            name
          }
          proficiency
        }
      }
    }
  }
`;

// Updated ProfileList component to display bio text
async function ProfileList() {
  // Fetch teachers data server-side
  const { data } = await getClient().query({
    query: GET_TEACHERS,
  });

  // Filter users to only include those with teacher profiles
  const teachers = data.publicUsers.filter((user) => user.teacherProfile);

  return (
    <div className="grid grid-cols-1 gap-6">
      {teachers.map((user) => {
        const teacherProfile = user.teacherProfile;

        // Convert HTML bio to plain text for display
        const bioText = user.userProfile?.bio
          ? convert(user.userProfile.bio, {
              wordwrap: 130,
              limits: {
                maxInputLength: 250,
              },
            })
          : "";

        // Truncate bio text if it's too long
        const truncatedBio =
          bioText.length > 150 ? bioText.substring(0, 150) + "..." : bioText;

        return (
          <Link
            href={`/dashboard/teachers/${teacherProfile.id}`}
            key={user.id}
            className="block transition-all hover:shadow-md"
          >
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={user.imageUrl}
                    alt={`${user.firstName} ${user.lastInitial}`}
                  />
                  <AvatarFallback>
                    {user.firstName?.[0] || ""}
                    {user.lastInitial || ""}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>
                    {user.firstName} {user.lastInitial}
                  </CardTitle>
                  <CardDescription>Teacher Profile</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {truncatedBio && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {truncatedBio}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {teacherProfile.skills.map((skillItem) => (
                    <UserSkillBadge key={skillItem.id} userSkill={skillItem} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

// Updated ProfileSkeleton to include bio
function ProfileSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full mb-4" />
            <div className="flex flex-wrap gap-2 mt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function TeachersPage() {
  return (
    <div className="container p-2">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileList />
      </Suspense>
    </div>
  );
}
