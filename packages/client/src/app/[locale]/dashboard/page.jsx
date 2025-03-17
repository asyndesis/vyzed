"use client";

import { useQuery, gql } from "@apollo/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusCircle,
  GraduationCap,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { renderProficiency, getProficiencyBadge, cn } from "@/lib/utils";

// GraphQL query to fetch user profile data
const GET_USER_PROFILES = gql`
  query GetUserProfiles {
    me {
      id
      firstName
      lastName
      email
      studentProfile {
        id
        name
        bio
      }
      teacherProfiles {
        id
        name
        bio
        skills {
          id
          proficiency
          skill {
            id
            name
          }
        }
      }
    }
  }
`;

export default function Page() {
  // Use Apollo client-side query
  const { data, loading, error } = useQuery(GET_USER_PROFILES, {
    fetchPolicy: "cache-and-network", // Use cache but also check network for updates
  });

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="container p-4 max-w-6xl mx-auto">
        <div className="p-6 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/10 dark:border-red-800/30">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
            Error loading dashboard
          </h2>
          <p className="text-red-600 dark:text-red-300">
            {error.message || "Please try refreshing the page."}
          </p>
        </div>
      </div>
    );
  }

  // Rest of the component remains the same, just use data directly
  const user = data?.me;
  const hasStudentProfile = !!user?.studentProfile;
  const teacherProfiles = user?.teacherProfiles || [];

  return (
    <div className="container px-2 space-y-8 max-w-6xl mx-auto">
      {/* Header - Improved spacing and responsiveness */}
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your learning and teaching profiles
        </p>
        <Separator className="mt-4" />
      </header>

      {/* Profiles Grid - Improved spacing and responsiveness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Student Profile Section - Better mobile layout */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
                <h2 className="text-xl sm:text-2xl font-semibold">
                  Student Profile
                </h2>
                {hasStudentProfile ? (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not Created
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Track your learning journey
              </p>
            </div>
            {!hasStudentProfile && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="gap-1.5 sm:self-start"
              >
                <Link href="/student-profile/create">
                  <PlusCircle className="h-4 w-4" />
                  <span className="whitespace-nowrap">Create Profile</span>
                </Link>
              </Button>
            )}
          </div>

          {hasStudentProfile ? (
            <Card className="overflow-hidden transition-all hover:shadow-md flex flex-col">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-lg sm:text-xl">
                  {user.studentProfile.name || "Your Student Profile"}
                </CardTitle>
                <CardDescription>
                  {user.studentProfile.bio
                    ? user.studentProfile.bio.length > 100
                      ? user.studentProfile.bio.substring(0, 100) + "..."
                      : user.studentProfile.bio
                    : "Access your courses and track your progress"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30 gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Ready to continue learning?
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pick up where you left off with your courses
                    </p>
                  </div>
                  <Badge className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 border-none self-start sm:self-auto">
                    Student
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-4">
                <Button
                  asChild
                  className="w-full gap-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                  size="sm"
                >
                  <Link href={`/student-profile/${user.studentProfile.id}`}>
                    View Profile
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border border-dashed border-amber-200 dark:border-amber-800/40 bg-amber-50/20 dark:bg-amber-900/5 hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-colors flex flex-col">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-lg sm:text-xl text-amber-700 dark:text-amber-400">
                  No Student Profile
                </CardTitle>
                <CardDescription className="text-amber-600/70 dark:text-amber-500/70">
                  Create a profile to start your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                <div className="flex flex-col items-center justify-center py-4 space-y-3 text-center">
                  <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2">
                    <BookOpen className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-sm text-amber-700/80 dark:text-amber-400/80 max-w-md">
                    As a student, you can browse courses, track your progress,
                    and connect with teachers.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-4">
                <Button
                  asChild
                  className="w-full gap-1.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
                  size="sm"
                >
                  <Link href="/student-profile/create">
                    <PlusCircle className="h-4 w-4" />
                    Create Student Profile
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </section>

        {/* Teacher Profiles Section - Better mobile layout */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary flex-shrink-0" />
                <h2 className="text-xl sm:text-2xl font-semibold">
                  Teacher Profiles
                </h2>
                {teacherProfiles.length > 0 ? (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {teacherProfiles.length} Active
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    None Created
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Share your expertise and connect with students
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 sm:self-start"
            >
              <Link href="/teacher-profile/create">
                <PlusCircle className="h-4 w-4" />
                <span className="whitespace-nowrap">New Profile</span>
              </Link>
            </Button>
          </div>

          {teacherProfiles.length > 0 ? (
            <div className="space-y-4 h-full">
              <Card
                key={teacherProfiles[0].id}
                className="overflow-hidden transition-all hover:shadow-md flex flex-col"
              >
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <CardHeader className="pb-2 pt-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg sm:text-xl">
                      {teacherProfiles[0].name || "Teacher Profile"}
                    </CardTitle>
                    <Badge className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 border-none">
                      {teacherProfiles[0].skills.length} skills
                    </Badge>
                  </div>
                  <CardDescription>
                    {teacherProfiles[0].bio
                      ? teacherProfiles[0].bio.length > 100
                        ? teacherProfiles[0].bio.substring(0, 100) + "..."
                        : teacherProfiles[0].bio
                      : "Share your knowledge and expertise"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3 pt-0">
                  {teacherProfiles[0].skills.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-emerald-700/70 dark:text-emerald-400/70 uppercase tracking-wider">
                        Top Skills
                      </p>
                      <ul className="space-y-2">
                        {teacherProfiles[0].skills.slice(0, 3).map((skill) => (
                          <li
                            key={skill.id}
                            className="flex items-center justify-between text-sm p-2 rounded-md bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30"
                          >
                            <span className="font-medium truncate mr-2">
                              {skill.skill.name}
                            </span>
                            <Badge
                              className={cn(
                                "text-xs flex-shrink-0",
                                getProficiencyBadge(skill.proficiency)
                              )}
                            >
                              {renderProficiency(skill)}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-24 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-md border border-emerald-100 dark:border-emerald-800/30">
                      <p className="text-sm text-emerald-700/70 dark:text-emerald-400/70">
                        No skills added yet
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2 pb-4">
                  <Button
                    asChild
                    className="w-full gap-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                    size="sm"
                  >
                    <Link
                      href={`/dashboard/teacher-profile/${teacherProfiles[0].id}/edit`}
                    >
                      Manage Profile
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {teacherProfiles.length > 1 && (
                <div className="text-center mt-4">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 w-full sm:w-auto"
                  >
                    <Link href="/teacher-profiles">
                      View All Teacher Profiles ({teacherProfiles.length})
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card className="border border-dashed border-amber-200 dark:border-amber-800/40 bg-amber-50/20 dark:bg-amber-900/5 hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-colors flex flex-col">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-lg sm:text-xl text-amber-700 dark:text-amber-400">
                  No Teacher Profiles
                </CardTitle>
                <CardDescription className="text-amber-600/70 dark:text-amber-500/70">
                  Create a profile to start teaching
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center">
                <div className="flex flex-col items-center justify-center py-4 space-y-3 text-center">
                  <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2">
                    <BookOpen className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-sm text-amber-700/80 dark:text-amber-400/80 max-w-md">
                    Share your expertise by creating a teacher profile and
                    listing your skills. Connect with students and start your
                    teaching journey.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-4">
                <Button
                  asChild
                  className="w-full gap-1.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
                  size="sm"
                >
                  <Link href="/teacher-profile/create">
                    <PlusCircle className="h-4 w-4" />
                    Create Teacher Profile
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}

// Update the skeleton to match the new layout
function DashboardSkeleton() {
  return (
    <div className="container p-2 space-y-8 max-w-6xl mx-auto">
      {/* Header Skeleton */}
      <header className="space-y-2">
        <Skeleton className="h-8 sm:h-10 w-48 mb-2" />
        <Skeleton className="h-4 sm:h-5 w-72" />
        <Separator className="mt-4" />
      </header>

      {/* Profiles Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Student Profile Skeleton */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="space-y-1">
              <Skeleton className="h-7 sm:h-8 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>

          <Card className="overflow-hidden flex flex-col">
            <div className="h-1.5 bg-gradient-to-r from-gray-200 to-gray-300" />
            <CardHeader className="pb-2 pt-4">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="pb-3 pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg gap-2">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-4">
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        </section>

        {/* Teacher Profile Skeleton */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="space-y-1">
              <Skeleton className="h-7 sm:h-8 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>

          <Card className="overflow-hidden flex flex-col">
            <div className="h-1.5 bg-gradient-to-r from-gray-200 to-gray-300" />
            <CardHeader className="pb-2 pt-4">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="pb-3 pt-0">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="space-y-2">
                  <Skeleton className="h-9 w-full rounded-md" />
                  <Skeleton className="h-9 w-full rounded-md" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-4">
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        </section>
      </div>
    </div>
  );
}
