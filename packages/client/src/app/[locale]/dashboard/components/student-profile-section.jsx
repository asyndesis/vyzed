"use client";

import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
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
import {
  BookOpen,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteProfileDialog } from "./delete-profile-dialog";

// Delete mutation
const DELETE_STUDENT_PROFILE = gql`
  mutation DeleteStudentProfile($id: PostgresID!) {
    deleteStudentProfile(id: $id)
  }
`;

export function StudentProfileSection({ user, hasStudentProfile }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const [deleteStudentProfile, { loading: deletingStudent }] = useMutation(
    DELETE_STUDENT_PROFILE,
    {
      onCompleted: () => {
        setDialogOpen(false);
        // Force a refresh of the page to show updated data
        window.location.reload();
      },
    }
  );

  const handleDeleteConfirm = () => {
    deleteStudentProfile({
      variables: {
        id: user.studentProfile.id,
      },
    });
  };

  return (
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
              Your Student Profile
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
          <CardFooter className="pt-2 pb-4 flex flex-col sm:flex-row gap-2 w-full">
            <Button
              asChild
              className="w-full sm:flex-1 gap-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              size="sm"
            >
              <Link href={`/student-profile/${user.studentProfile.id}`}>
                View Profile
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
              onClick={() => setDialogOpen(true)}
              disabled={deletingStudent}
            >
              <Trash2 className="h-5 w-5" />
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
                As a student, you can browse courses, track your progress, and
                connect with teachers.
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

      {/* Delete Profile Dialog */}
      <DeleteProfileDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={deletingStudent}
        profileType="student"
      />
    </section>
  );
}
