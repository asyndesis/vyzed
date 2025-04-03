import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { UserCircle, ChevronRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function UserProfileSection({ user }) {
  return (
    <section className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <UserCircle className="h-5 w-5 text-primary flex-shrink-0" />
            <h2 className="text-xl sm:text-2xl font-semibold">User Profile</h2>
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
          <div className="h-1.5 bg-gradient-to-r from-purple-500 to-pink-500" />
          <CardHeader className="pb-2 pt-4">
            <div className="flex justify-between items-start">
              <div className="text-xs font-medium text-purple-700/70 dark:text-purple-400/70 uppercase tracking-wider">
                Personal Information
              </div>
              <Badge className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 border-none">
                {user.userProfile?.languages?.length || 0} languages
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-3 pt-0">
            {user.userProfile?.bio ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  {user.userProfile.bio}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 bg-purple-50/30 dark:bg-purple-900/10 rounded-md border border-purple-100 dark:border-purple-800/30">
                <p className="text-sm text-purple-700/70 dark:text-purple-400/70">
                  No bio added yet
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2 pb-4">
            <Button
              asChild
              className="w-full gap-1.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
              size="sm"
            >
              <Link
                href={`/dashboard/user-profile/${user.id}/edit`}
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
