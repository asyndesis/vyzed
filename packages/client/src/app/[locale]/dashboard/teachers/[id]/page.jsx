import { gql } from "@apollo/client";
import { getClient } from "@/lib/apollo-client";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  Calendar,
  User,
  GraduationCap,
  Mail,
  Globe,
  ArrowLeftRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
import { PageHeader } from "@/components/page-header";
import { RequestLessonButton } from "../components/request-lesson-button";
// GraphQL query to fetch a specific teacher profile
const GET_PUBLIC_USER = gql`
  query PublicUserById($id: PostgresID!) {
    publicUserById(id: $id) {
      id
      firstName
      lastInitial
      imageUrl
      createdAt
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
        allowBarter
        priceAmount
        priceCurrency
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
      studentProfile {
        id
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
  }
`;

export async function generateMetadata({ params }) {
  const { id } = await params;

  const { data } = await getClient().query({
    query: GET_PUBLIC_USER,
    variables: { id },
  });

  const profile = data?.publicUserById;

  if (!profile) {
    return { title: "Teacher Not Found" };
  }

  return {
    title: `${profile.firstName} ${profile.lastInitial} - Teacher Profile`,
    description: `View ${profile.firstName}'s teaching profile and skills`,
  };
}

async function TeacherProfileDetail({ id }) {
  const { data } = await getClient().query({
    query: GET_PUBLIC_USER,
    variables: { id },
  });

  const user = data?.publicUserById;

  if (!user) {
    notFound();
  }

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <>
      <PageHeader
        title={`${user.firstName} ${user.lastInitial}`}
        description="View the teacher's profile and skills"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Teacher Info Card - Enhanced */}
        <Card className="md:col-span-1 overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-40 w-40 rounded-md border-4 border-background shadow-lg">
                <AvatarImage
                  src={user.imageUrl}
                  alt={`${user.firstName} ${user.lastInitial}`}
                />
                <AvatarFallback className="text-2xl">
                  {user.firstName[0]}
                  {user.lastInitial}
                </AvatarFallback>
              </Avatar>

              <div className="text-center pt-2">
                <h2 className="text-xl font-semibold">
                  {user.firstName} {user.lastInitial}
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
            <RequestLessonButton user={user} />
          </CardFooter>
        </Card>

        {/* Main Content: Bio, Skills, and Languages */}
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
              {user.userProfile?.bio ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div
                    dangerouslySetInnerHTML={{ __html: user.userProfile.bio }}
                  />
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

          {/* Teaching Skills - Enhanced */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5" />
                Teaching Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.teacherProfile?.skills &&
              user.teacherProfile.skills.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {user.teacherProfile.skills.map((skillItem) => (
                    <div
                      key={skillItem.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/10 transition-colors"
                    >
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

          {/* Languages - New section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5" />
                Spoken Languages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.userProfile?.languages &&
              user.userProfile.languages.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {user.userProfile.languages.map((language) => (
                    <div
                      key={language.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/10 transition-colors"
                    >
                      <UserSkillBadge userSkill={language} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg border border-dashed">
                  <Globe className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-center">
                    No languages have been added yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Skills section - New */}
          <Card>
            <CardHeader className="pb-3">
              {user.teacherProfile.allowBarter ? (
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ArrowLeftRight className="h-5 w-5" />
                  Skills they will barter for
                </CardTitle>
              ) : (
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-5 w-5" />
                  Skills they are learning
                </CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {user.studentProfile?.skills &&
              user.studentProfile.skills.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {user.studentProfile.skills.map((skillItem) => (
                    <div
                      key={skillItem.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/10 transition-colors"
                    >
                      <UserSkillBadge userSkill={skillItem} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg border border-dashed">
                  <ArrowLeftRight className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-center">
                    This teacher is not looking for skill exchanges.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

// Update skeleton to match new layout too
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
              <Skeleton className="h-40 w-40 rounded-md" />
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

          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
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
  const { id } = await params;
  return (
    <Suspense fallback={<ProfileDetailSkeleton />}>
      <TeacherProfileDetail id={id} />
    </Suspense>
  );
}
