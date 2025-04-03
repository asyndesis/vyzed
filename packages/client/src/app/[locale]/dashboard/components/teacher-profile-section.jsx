import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { GraduationCap, ChevronRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import UserSkillBadge from "@/components/user-skill-badge";

export function TeacherProfileSection({ user }) {
  return (
    <section className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl font-semibold">
              Teacher Profile
            </h2>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </div>
      </div>

      <div className="h-full">
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
                    <UserSkillBadge key={userSkill.id} userSkill={userSkill} />
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
          <CardFooter className="pt-2 pb-4">
            <Button
              asChild
              className="w-full gap-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
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
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
