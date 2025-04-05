"use client";
import { useQuery, gql } from "@apollo/client";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, Loader2 } from "lucide-react";
import UserSkillBadge from "@/components/user-skill-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LessonStatus } from "@vyzed/constants/lesson";
const GET_MY_LESSONS = gql`
  query GetMyLessons {
    myLessonsAsTeacher {
      id
      title
      description
      startTime
      endTime
      status
      proficiency
      skill {
        id
        name
      }
      enrollments {
        id
        status
        student {
          firstName
          lastInitial
        }
      }
    }
    myLessonsAsStudent {
      id
      title
      description
      startTime
      endTime
      status
      proficiency
      skill {
        id
        name
      }
      teacher {
        firstName
        lastInitial
      }
    }
  }
`;

export function MyLessons() {
  const { loading, error, data } = useQuery(GET_MY_LESSONS, {
    fetchPolicy: "network-only",
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your lessons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was a problem loading your lessons: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  const teacherLessons = data?.myLessonsAsTeacher || [];
  const studentLessons = data?.myLessonsAsStudent || [];

  // Extract unique skills and statuses for filters
  const allSkills = [
    ...new Map([
      ...teacherLessons.map((lesson) => [lesson.skill.id, lesson.skill]),
      ...studentLessons.map((lesson) => [lesson.skill.id, lesson.skill]),
    ]).values(),
  ];

  const allStatuses = [
    ...new Set([
      ...teacherLessons.map((lesson) => lesson.status),
      ...studentLessons.map((lesson) => lesson.status),
    ]),
  ];

  return (
    <Tabs defaultValue="teacher" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="teacher">
          Teaching ({teacherLessons.length})
        </TabsTrigger>
        <TabsTrigger value="student">
          Learning ({studentLessons.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="teacher">
        <LessonsTable
          lessons={teacherLessons}
          isTeacher={true}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          skillFilter={skillFilter}
          setSkillFilter={setSkillFilter}
          allSkills={allSkills}
          allStatuses={allStatuses}
        />
      </TabsContent>

      <TabsContent value="student">
        <LessonsTable
          lessons={studentLessons}
          isTeacher={false}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          skillFilter={skillFilter}
          setSkillFilter={setSkillFilter}
          allSkills={allSkills}
          allStatuses={allStatuses}
        />
      </TabsContent>
    </Tabs>
  );
}

function LessonsTable({
  lessons,
  isTeacher,
  statusFilter,
  setStatusFilter,
  skillFilter,
  setSkillFilter,
  allSkills,
  allStatuses,
}) {
  // Apply filters
  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      // Status filter
      const matchesStatus =
        statusFilter === "all" || lesson.status === statusFilter;

      // Skill filter
      const matchesSkill =
        skillFilter === "all" || lesson.skill.id === skillFilter;

      return matchesStatus && matchesSkill;
    });
  }, [lessons, statusFilter, skillFilter]);

  if (lessons.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        You don&apos;t have any {isTeacher ? "teaching" : "learning"} sessions
        yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {allStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              {allSkills.map((skill) => (
                <SelectItem key={skill.id} value={skill.id}>
                  {skill.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Skill</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>{isTeacher ? "Students" : "Teacher"}</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLessons.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  No lessons match your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredLessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell className="font-medium">
                    <div>{lesson.title}</div>
                    {lesson.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {lesson.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="inline-block">
                      <UserSkillBadge
                        userSkill={{
                          skill: lesson.skill,
                          proficiency: lesson.proficiency,
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <div className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>{format(new Date(lesson.startTime), "PPP")}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {format(new Date(lesson.startTime), "h:mm a")} -{" "}
                          {format(new Date(lesson.endTime), "h:mm a")}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isTeacher ? (
                      lesson.enrollments.length > 0 ? (
                        lesson.enrollments.length === 1 ? (
                          <div>
                            {lesson.enrollments[0].student.firstName}{" "}
                            {lesson.enrollments[0].student.lastInitial}
                          </div>
                        ) : (
                          <div>{lesson.enrollments.length} students</div>
                        )
                      ) : (
                        <div className="text-muted-foreground">No students</div>
                      )
                    ) : (
                      <div>
                        {lesson.teacher.firstName} {lesson.teacher.lastInitial}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(lesson.status)}`}
                    >
                      {lesson.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case LessonStatus.CONFIRMED:
      return "bg-green-100 text-green-800";
    case LessonStatus.COMPLETED:
      return "bg-purple-100 text-purple-800";
    case LessonStatus.CANCELLED:
    case LessonStatus.REJECTED:
      return "bg-red-100 text-red-800";
    case LessonStatus.REQUESTED:
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
