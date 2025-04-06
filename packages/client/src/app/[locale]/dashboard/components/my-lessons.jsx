"use client";
import { useQuery, gql } from "@apollo/client";
import { useState, useMemo, useEffect, createContext, useContext } from "react";
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

import { LessonStatus } from "@vyzed/prisma/enums";
import { LessonDetailModal } from "./lesson-detail-modal";
import { StatusBadge } from "@/components/status-badge";

const GET_MY_LESSONS = gql`
  query GetMyLessons($filter: LessonFilterInput) {
    myLessonsAsTeacher(filter: $filter) {
      id
      startTime
      endTime
      status
      proficiency
      skill {
        id
        name
        framework
      }
      enrollments {
        id
        status
        paymentType
        paymentAmount
        paymentCurrency
        barterLessonId
        student {
          firstName
          lastInitial
        }
      }
    }
    myLessonsAsStudent(filter: $filter) {
      id
      startTime
      endTime
      status
      proficiency
      teacher {
        firstName
        lastInitial
      }
      skill {
        id
        name
        framework
      }
      enrollments {
        id
        status
        paymentType
        paymentAmount
        paymentCurrency
        barterLessonId
      }
    }
  }
`;

// Create a context for filter state
const LessonFiltersContext = createContext();

// Custom hook to use the filter context
function useLessonFilters() {
  const context = useContext(LessonFiltersContext);
  if (!context) {
    throw new Error(
      "useLessonFilters must be used within a LessonFiltersProvider"
    );
  }
  return context;
}

export function MyLessons() {
  // State for filters
  const [statusFilter, setStatusFilter] = useState(null);
  const [timeframeFilter, setTimeframeFilter] = useState("upcoming"); // "upcoming" or "past"
  const [skillFilter, setSkillFilter] = useState("all"); // Client-side filter
  const [activeTab, setActiveTab] = useState("teacher");

  // Prepare GraphQL filter variables
  const filterVariables = useMemo(() => {
    const filter = {};

    // Add status filter if selected
    if (statusFilter) {
      filter.status = statusFilter;
    }

    // Add date filters based on timeframe
    const now = new Date();
    if (timeframeFilter === "upcoming") {
      filter.startDateFrom = now;
    } else if (timeframeFilter === "past") {
      filter.startDateTo = now;
    }

    return { filter };
  }, [statusFilter, timeframeFilter]);

  // Query with filters
  const { loading, error, data, refetch } = useQuery(GET_MY_LESSONS, {
    variables: filterVariables,
    fetchPolicy: "cache-and-network",
  });

  // Refetch when filters change
  useEffect(() => {
    refetch(filterVariables);
  }, [filterVariables, refetch]);

  // Extract unique skills from data
  const allSkills = useMemo(() => {
    if (!data) return [];

    const teacherLessons = data?.myLessonsAsTeacher || [];
    const studentLessons = data?.myLessonsAsStudent || [];

    return [
      ...new Map([
        ...teacherLessons.map((lesson) => [lesson.skill.id, lesson.skill]),
        ...studentLessons.map((lesson) => [lesson.skill.id, lesson.skill]),
      ]).values(),
    ];
  }, [data]);

  // Context value (removed allStatuses)
  const filterContextValue = {
    statusFilter,
    setStatusFilter,
    timeframeFilter,
    setTimeframeFilter,
    skillFilter,
    setSkillFilter,
    allSkills,
  };

  return (
    <LessonFiltersContext.Provider value={filterContextValue}>
      <div className="space-y-4">
        {/* Filters at the top of the page */}
        <FiltersUI />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="teacher">
              Teaching{" "}
              {loading ? "" : `(${data?.myLessonsAsTeacher?.length || 0})`}
            </TabsTrigger>
            <TabsTrigger value="student">
              Learning{" "}
              {loading ? "" : `(${data?.myLessonsAsStudent?.length || 0})`}
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading your lessons...</p>
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="my-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                There was a problem loading your lessons: {error.message}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <TabsContent value="teacher">
                <LessonsTable
                  lessons={data?.myLessonsAsTeacher || []}
                  isTeacher={true}
                />
              </TabsContent>
              <TabsContent value="student">
                <LessonsTable
                  lessons={data?.myLessonsAsStudent || []}
                  isTeacher={false}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </LessonFiltersContext.Provider>
  );
}

// Separate component for the filters UI
function FiltersUI() {
  const {
    statusFilter,
    setStatusFilter,
    timeframeFilter,
    setTimeframeFilter,
    skillFilter,
    setSkillFilter,
    allSkills,
  } = useLessonFilters();

  // Use all enum values directly from LessonStatus
  const statusOptions = Object.values(LessonStatus);

  return (
    <div className="flex justify-end mb-4">
      <div className="flex gap-2">
        <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue>
              {timeframeFilter === "upcoming"
                ? "Upcoming Lessons"
                : timeframeFilter === "past"
                  ? "Past Lessons"
                  : "All Lessons"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">Upcoming Lessons</SelectItem>
            <SelectItem value="past">Past Lessons</SelectItem>
            <SelectItem value="all">All Lessons</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter || "all"}
          onValueChange={(value) =>
            setStatusFilter(value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue>
              {statusFilter ? (
                <StatusBadge status={statusFilter} />
              ) : (
                "All Statuses"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                <StatusBadge status={status} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={skillFilter} onValueChange={setSkillFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue>
              {skillFilter === "all"
                ? "All Skills"
                : allSkills.find((skill) => skill.id === skillFilter)?.name ||
                  "Select skill"}
            </SelectValue>
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
  );
}

// Table component that doesn't need filter props anymore
function LessonsTable({ lessons, isTeacher }) {
  const { skillFilter } = useLessonFilters();
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Apply client-side skill filter
  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      // Skill filter is applied client-side
      return skillFilter === "all" || lesson.skill.id === skillFilter;
    });
  }, [lessons, skillFilter]);

  if (lessons.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        You don&apos;t have any {isTeacher ? "teaching" : "learning"} sessions
        yet.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
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
                  colSpan={4}
                  className="text-center h-24 text-muted-foreground"
                >
                  No lessons match your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredLessons.map((lesson) => (
                <TableRow
                  key={lesson.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedLesson(lesson)}
                >
                  <TableCell>
                    <div className="inline-block">
                      <UserSkillBadge
                        userSkill={{
                          skill: lesson.skill,
                          proficiency: lesson.proficiency,
                          framework: lesson.skill.framework,
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
                    <StatusBadge status={lesson.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Lesson Detail Modal */}
      {selectedLesson && (
        <LessonDetailModal
          lesson={selectedLesson}
          isOpen={!!selectedLesson}
          onClose={() => setSelectedLesson(null)}
          isTeacher={isTeacher}
        />
      )}
    </>
  );
}
