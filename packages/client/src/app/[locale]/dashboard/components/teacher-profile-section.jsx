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
  GraduationCap,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteProfileDialog } from "./delete-profile-dialog";
import { createTeacherProfile, deleteTeacherProfile } from "../actions";
import { useTransition } from "react";
import UserSkillBadge from "@/components/user-skill-badge";
import { convert } from "html-to-text";
export function TeacherProfileSection({ user, hasTeacherProfile }) {
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
        await deleteTeacherProfile(user.teacherProfile.id);
        setDialogOpen(false);
        router.refresh();
      } catch (error) {
        console.error("Error deleting teacher profile:", error);
      }
    });
  };

  const handleCreateTeacherProfile = () => {
    setActionType("create");
    startTransition(async () => {
      try {
        const profileId = await createTeacherProfile(user.id);
        router.push(`/dashboard/teacher-profile/${profileId}/edit`);
      } catch (error) {
        console.error("Error creating teacher profile:", error);
      }
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl font-semibold">
              Teacher Profile
            </h2>
            {hasTeacherProfile ? (
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
            Share your expertise and connect with students
          </p>
        </div>
        {!hasTeacherProfile && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 sm:self-start"
            onClick={handleCreateTeacherProfile}
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

      {hasTeacherProfile ? (
        <div className="space-y-4 h-full">
          <Card className="overflow-hidden transition-all flex flex-col">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardHeader className="pb-2 pt-4">
              <div className="flex justify-between items-start">
                <div className="text-xs font-medium text-emerald-700/70 dark:text-emerald-400/70 uppercase tracking-wider">
                  Teaching Skills
                </div>
                <Badge className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300 border-none">
                  {user.teacherProfile.skills.length} skills
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-3 pt-0">
              {user.teacherProfile.skills.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user.teacherProfile.skills.map((userSkill) => (
                      <UserSkillBadge
                        key={userSkill.id}
                        userSkill={userSkill}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-md border border-emerald-100 dark:border-emerald-800/30">
                  <p className="text-sm text-emerald-700/70 dark:text-emerald-400/70">
                    No skills added yet
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-2 pb-4 flex flex-col sm:flex-row gap-2 w-full">
              <Button
                asChild
                className="w-full sm:flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                size="sm"
              >
                <Link
                  href={`/dashboard/teacher-profile/${user.teacherProfile.id}/edit`}
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
              No Teacher Profile
            </CardTitle>
            <CardDescription className="text-amber-600/70 dark:text-amber-500/70">
              Create a profile to start teaching
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="flex flex-col items-center justify-center py-4 space-y-3 text-center">
              <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-2">
                <GraduationCap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-sm text-amber-700/80 dark:text-amber-400/80 max-w-md">
                Share your expertise by creating a teacher profile and listing
                your skills. Connect with students and start your teaching
                journey.
              </p>
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-4">
            <Button
              className="w-full gap-1.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
              size="sm"
              onClick={handleCreateTeacherProfile}
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
                  Create Teacher Profile
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
        profileType="teacher"
      />
    </section>
  );
}
