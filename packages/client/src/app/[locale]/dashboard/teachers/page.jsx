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
import { BookOpen, Globe } from "lucide-react";

export const metadata = {
  title: "Teachers",
  description: "Find a teacher for your child",
};

// Updated GraphQL query to include userProfile.languages
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

// Updated ProfileList component to display bio text and languages
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
        const languages = user.userProfile?.languages || [];

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
            href={`/dashboard/teachers/${user.id}`}
            key={user.id}
            className="block"
          >
            <Card className="overflow-hidden transition-all hover:shadow-md">
              <div className="flex">
                <div className="pl-6 pt-6">
                  <Avatar className="h-40 w-40 rounded-md">
                    <AvatarImage
                      src={user.imageUrl}
                      alt={`${user.firstName} ${user.lastInitial}`}
                    />
                    <AvatarFallback>
                      {user.firstName?.[0] || ""}
                      {user.lastInitial || ""}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <CardHeader className="pb-2">
                    <CardTitle>
                      {user.firstName} {user.lastInitial}
                    </CardTitle>
                    <CardDescription>Teacher Profile</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {truncatedBio && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {truncatedBio}
                      </p>
                    )}

                    {/* Teaching Skills Section */}
                    {teacherProfile.skills.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5" />
                          TEACHING SKILLS
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {teacherProfile.skills.map((skillItem) => (
                            <UserSkillBadge
                              key={skillItem.id}
                              userSkill={skillItem}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages Section */}
                    {languages.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5" />
                          SPOKEN LANGUAGES
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {languages.map((skillItem) => (
                            <UserSkillBadge
                              key={skillItem.id}
                              userSkill={skillItem}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

// Updated ProfileSkeleton to include languages
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
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />

            {/* Teaching Skills Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            </div>

            {/* Languages Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-36" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
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
