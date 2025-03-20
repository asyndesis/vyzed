import { gql } from "@apollo/client";
import { getClient } from "@/lib/apollo-client";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Calendar, User, GraduationCap, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import UserSkillBadge from "@/components/user-skill-badge";

// GraphQL query to fetch a specific teacher profile
const GET_TEACHER = gql`
  query TeacherProfile($id: PostgresID!) {
    teacherProfileById(id: $id) {
      id
      userId
      user {
        id
        firstName
        lastInitial
        imageUrl
        createdAt
      }
      skills {
        id
        skill {
          id
          name
          framework
        }
        proficiency
      }
    }
  }
`;

export async function generateMetadata({ params }) {
  const { data } = await getClient().query({
    query: GET_TEACHER,
    variables: { id: params.id },
  });

  const profile = data?.teacherProfileById;

  if (!profile) {
    return { title: "Teacher Not Found" };
  }

  return {
    title: `${profile.user.firstName} ${profile.user.lastInitial} - Teacher Profile`,
    description: `View ${profile.user.firstName}'s teaching profile and skills`,
  };
}

async function TeacherProfileDetail({ id }) {
  const { data } = await getClient().query({
    query: GET_TEACHER,
    variables: { id },
  });

  const teacher = data?.teacherProfileById;

  if (!teacher) {
    notFound();
  }

  const joinedDate = new Date(teacher.user.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
    }
  );

  return (
    <div className="container p-2 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {teacher.user.firstName} {teacher.user.lastInitial}
        </h1>
        <div className="text-muted-foreground mt-1 flex items-center gap-2">
          <Badge variant="outline">Teacher</Badge>
          <span className="text-sm">·</span>
          <span className="text-sm flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5" />
            {teacher.skills.length} skills
          </span>
        </div>
      </header>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Teacher Info Card - Refined */}
        <Card className="md:col-span-1 overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-28 w-28 border-4 border-background">
                <AvatarImage
                  src={teacher.user.imageUrl}
                  alt={`${teacher.user.firstName} ${teacher.user.lastInitial}`}
                />
                <AvatarFallback className="text-xl">
                  {teacher.user.firstName[0]}
                  {teacher.user.lastInitial}
                </AvatarFallback>
              </Avatar>

              <div className="text-center pt-2">
                <h2 className="text-xl font-semibold">
                  {teacher.user.firstName} {teacher.user.lastInitial}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Experienced Teacher
                </p>
              </div>

              <div className="w-full space-y-3 border-t pt-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Joined {joinedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">Contact via platform</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Contact Teacher</Button>
          </CardFooter>
        </Card>

        {/* Main Content: Bio and Skills */}
        <div className="md:col-span-2 space-y-6">
          {/* Bio - With better styling */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teacher.bio ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: teacher.bio }} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center bg-muted/20 rounded-lg border border-dashed">
                  <p className="text-muted-foreground italic">
                    This teacher has not added a bio yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills - With better styling */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5" />
                Teaching Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teacher.skills && teacher.skills.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {teacher.skills.map((skillItem) => (
                    <div
                      key={skillItem.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/10 transition-colors"
                    >
                      <div className="font-medium">{skillItem.skill.name}</div>
                      <UserSkillBadge userSkill={skillItem} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg border border-dashed">
                  <GraduationCap className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-center">
                    This teacher has not added any skills yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton - Updated to match new design
function ProfileDetailSkeleton() {
  return (
    <>
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4 mx-1" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-36" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Separator className="mt-4" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-28 w-28 rounded-full" />
              <div className="space-y-2 text-center w-full pt-2">
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </div>
              <div className="w-full space-y-3 border-t pt-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default async function TeacherProfilePage({ params }) {
  return (
    <Suspense fallback={<ProfileDetailSkeleton />}>
      <TeacherProfileDetail id={params.id} />
    </Suspense>
  );
}
