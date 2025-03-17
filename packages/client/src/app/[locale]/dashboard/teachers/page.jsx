import { gql } from "@apollo/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getClient } from "@/lib/apollo-client";
import { renderProficiency } from "@/lib/utils";

// GraphQL query to fetch all profiles with their skills
const GET_TEACHERS = gql`
  query TeacherProfiles {
    teacherProfiles {
      userId
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
      {data.teacherProfiles.map((teacher) => (
        <Card key={teacher.userId} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={teacher.user.imageUrl}
                alt={`${teacher.user.firstName} ${teacher.user.lastInitial}`}
              />
              <AvatarFallback>
                {teacher.user.firstName[0]}
                {teacher.user.lastInitial[0]}
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
            <div className="flex flex-wrap gap-2 mt-2">
              {teacher.skills.map((skillItem) => (
                <Badge
                  key={skillItem.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {skillItem.skill.name}
                  <span className="ml-1 text-xs opacity-70">
                    {renderProficiency(skillItem)}
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
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
