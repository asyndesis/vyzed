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

// GraphQL query to fetch all profiles with their skills
const GET_TEACHERS = gql`
  query TeacherProfiles {
    teacherProfiles {
      id
      userId
      bio
      user {
        id
        firstName
        lastInitial
        imageUrl
      }
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
`;

// Create a ProfileList component that fetches and displays profiles
async function ProfileList() {
  // Fetch teachers data server-side
  const { data } = await getClient().query({
    query: GET_TEACHERS,
  });

  return (
    <div className="grid grid-cols-1 gap-6">
      {data.teacherProfiles.map((teacher) => {
        const sanitizedBio = teacher.bio ? convert(teacher.bio) : "";

        return (
          <Link
            href={`/dashboard/teachers/${teacher.id}`}
            key={teacher.userId}
            className="block transition-all hover:shadow-md"
          >
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={teacher.user.imageUrl}
                    alt={`${teacher.user.firstName} ${teacher.user.lastInitial}`}
                  />
                  <AvatarFallback>
                    {teacher.user.firstName[0]}
                    {teacher.user.lastInitial}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>
                    {teacher.user.firstName} {teacher.user.lastInitial}
                  </CardTitle>
                  <CardDescription>Teacher Profile</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {sanitizedBio && (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none mb-4"
                    dangerouslySetInnerHTML={{ __html: sanitizedBio }}
                  />
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {teacher.skills.map((skillItem) => (
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

// Create a loading skeleton component
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
            <Skeleton className="h-24 w-full mb-4" />
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
