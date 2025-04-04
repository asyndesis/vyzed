import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, BookOpen, GraduationCap, Edit } from "lucide-react";
import Link from "next/link";

export function DashboardProfileCards({ user }) {
  // Profile card configuration
  const profileCards = [
    {
      type: "user",
      title: "User Profile",
      icon: <UserCircle className="h-5 w-5 text-purple-600" />,
      gradient: "from-purple-500 to-pink-500",
      count: user.userProfile?.languages?.length || 0,
      countLabel: "languages",
      href: `/dashboard/user-profile/${user.id}/edit`,
    },
    {
      type: "student",
      title: "Student Profile",
      icon: <BookOpen className="h-5 w-5 text-blue-600" />,
      gradient: "from-blue-500 to-indigo-500",
      count: user.studentProfile?.skills?.length || 0,
      countLabel: "skills",
      href: `/dashboard/student-profile/${user.studentProfile?.id || ""}/edit`,
    },
    {
      type: "teacher",
      title: "Teacher Profile",
      icon: <GraduationCap className="h-5 w-5 text-green-600" />,
      gradient: "from-green-500 to-emerald-500",
      count: user.teacherProfile?.skills?.length || 0,
      countLabel: "skills",
      href: `/dashboard/teacher-profile/${user.teacherProfile?.id || ""}/edit`,
    },
  ];

  return profileCards.map((card) => (
    <Card key={card.type} className="overflow-hidden group">
      <div className={`h-1.5 bg-gradient-to-r ${card.gradient}`} />
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {card.icon}
            <h3 className="font-medium">{card.title}</h3>
          </div>
          <Button
            asChild
            size="icon"
            variant="ghost"
            className="h-8 w-8 opacity-70 hover:opacity-100 group-hover:bg-slate-100 dark:group-hover:bg-slate-800"
          >
            <Link href={card.href}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {card.count} {card.countLabel}
        </p>
      </CardContent>
    </Card>
  ));
}
