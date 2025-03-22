"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteProfileDialog } from "./delete-profile-dialog";
import { createStudentProfile, deleteStudentProfile } from "../actions";
import { useTransition } from "react";
import UserSkillBadge from "@/components/user-skill-badge";
import { convert } from "html-to-text";

export function StudentProfileSection({ user, hasStudentProfile }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionType, setActionType] = useState(null);

  const isCreating = isPending && actionType === "create";
  const isDeleting = isPending && actionType === "delete";

  const handleDeleteConfirm = () => {
    setActionType("delete");
    startTransition(async () => {
      try {
        await deleteStudentProfile(user.studentProfile.id);
        setDialogOpen(false);
        router.refresh();
      } catch (error) {
        console.error("Error deleting student profile:", error);
      }
    });
  };

  const handleCreateStudentProfile = () => {
    setActionType("create");
    startTransition(async () => {
      try {
        const profileId = await createStudentProfile(user.id);
        router.push(`/dashboard/student-profile/${profileId}/edit`);
      } catch (error) {
        console.error("Error creating student profile:", error);
      }
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
            variant="outline"
            size="sm"
            className="gap-1.5 sm:self-start"
            onClick={handleCreateStudentProfile}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="whitespace-nowrap">Creating...</span>
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" />
                <span className="whitespace-nowrap">Create Profile</span>
              </>
            )}
          </Button>
        )}
      </div>

      {hasStudentProfile ? (
        <div className="space-y-4 h-full">
          <Card className="overflow-hidden transition-all flex flex-col">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <CardHeader className="pb-2 pt-4">
              <div className="flex justify-between items-start">
                <div className="text-xs font-medium text-blue-700/70 dark:text-blue-400/70 uppercase tracking-wider">
                  Learning Skills
                </div>
                <Badge className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 border-none">
                  {user.studentProfile.skills?.length || 0} skills
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-3 pt-0">
              {user.studentProfile.skills?.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user.studentProfile.skills.map((userSkill) => (
                      <UserSkillBadge
                        key={userSkill.id}
                        userSkill={userSkill}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 bg-blue-50/30 dark:bg-blue-900/10 rounded-md border border-blue-100 dark:border-blue-800/30">
                  <p className="text-sm text-blue-700/70 dark:text-blue-400/70">
                    No skills added yet
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2 pb-4 flex flex-col sm:flex-row gap-2 w-full">
              <Button
                asChild
                className="w-full sm:flex-1 gap-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                size="sm"
              >
                <Link
                  href={`/dashboard/student-profile/${user.studentProfile.id}/edit`}
                  scroll={false}
                >
                  Edit Profile
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
                onClick={() => setDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>
        </div>
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
              className="w-full gap-1.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
              size="sm"
              onClick={handleCreateStudentProfile}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  Create Student Profile
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Delete Profile Dialog */}
      <DeleteProfileDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        profileType="student"
      />
    </section>
  );
}
