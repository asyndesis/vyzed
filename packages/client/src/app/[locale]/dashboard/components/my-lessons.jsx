"use client";
import { useQuery, gql } from "@apollo/client";
import { useState, useMemo, useEffect, createContext, useContext } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, Loader2, ArrowUpDown } from "lucide-react";
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
import { StatusBadge } from "@/components/status-badge";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { PaymentStatusBadge } from "../components/payment-status-badge";
import { TeacherLessonModal } from "./teacher-lesson-modal";
import { StudentEnrollmentModal } from "./student-enrollment-modal";

// GraphQL query for lessons
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
        teacherPaymentAt
        studentPaymentAt
        barterLessonId
        student {
          firstName
          lastInitial
          imageUrl
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
        imageUrl
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
        teacherPaymentAt
        studentPaymentAt
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

// Column definitions for TanStack Table
function getColumns(isTeacherMode) {
  return [
    {
      accessorKey: "skill",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent"
        >
          Skill
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const skill = row.original.skill;
        const proficiency = row.original.proficiency;
        const framework = skill?.framework;

        return (
          <div className="inline-block">
            <UserSkillBadge
              userSkill={{
                skill,
                proficiency,
                framework,
              }}
            />
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.skill.name.localeCompare(rowB.original.skill.name);
      },
    },
    {
      accessorKey: "startTime",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent"
        >
          Date & Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const startTime = new Date(row.original.startTime);
        const endTime = new Date(row.original.endTime);

        return (
          <div className="flex flex-col text-sm">
            <div className="flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1" />
              <span>{format(startTime, "PPP")}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>
                {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "person",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent"
        >
          {isTeacherMode ? "Students" : "Teacher"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        if (isTeacherMode) {
          const enrollments = row.original.enrollments || [];
          if (enrollments.length === 0) {
            return <div className="text-muted-foreground">No students</div>;
          } else if (enrollments.length === 1) {
            return (
              <div>
                {enrollments[0].student.firstName}{" "}
                {enrollments[0].student.lastInitial}
              </div>
            );
          } else {
            return <div>{enrollments.length} students</div>;
          }
        } else {
          const teacher = row.original.teacher;
          return (
            <div>
              {teacher.firstName} {teacher.lastInitial}
            </div>
          );
        }
      },
      sortingFn: (rowA, rowB) => {
        if (isTeacherMode) {
          const enrollmentsA = rowA.original.enrollments || [];
          const enrollmentsB = rowB.original.enrollments || [];

          // Sort by number of students
          return enrollmentsA.length - enrollmentsB.length;
        } else {
          const teacherA = rowA.original.teacher;
          const teacherB = rowB.original.teacher;

          // Sort by teacher's name
          return teacherA.firstName.localeCompare(teacherB.firstName);
        }
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = isTeacherMode
          ? row.original.status
          : row.original.enrollments[0]?.status || row.original.status;

        return <StatusBadge status={status} />;
      },
      sortingFn: (rowA, rowB) => {
        const statusA = isTeacherMode
          ? rowA.original.status
          : rowA.original.enrollments[0]?.status || rowA.original.status;

        const statusB = isTeacherMode
          ? rowB.original.status
          : rowB.original.enrollments[0]?.status || rowB.original.status;

        return statusA.localeCompare(statusB);
      },
    },
    {
      accessorKey: "payment",
      header: "Payment",
      cell: ({ row }) => {
        const enrollment = isTeacherMode
          ? row.original.enrollments.length > 0
            ? row.original.enrollments[0]
            : null
          : row.original.enrollments[0];

        return <PaymentStatusBadge enrollment={enrollment} />;
      },
      enableSorting: false,
    },
  ];
}

// Filter UI component
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

// Modify the SortableTable component to handle row clicks and dark mode hover
function SortableTable({ data, columns, onRowClick }) {
  const [sorting, setSorting] = useState([{ id: "startTime", desc: false }]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/50"
                onClick={() => onRowClick && onRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Modify the LessonsTable component to track selectedLessonId instead of selectedLesson
function LessonsTable({ lessons, mode, onUpdate }) {
  const { skillFilter } = useLessonFilters();
  const isTeacherMode = mode === "teacher";
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  // Get the fresh lesson data based on the selected ID
  const selectedLesson = lessons.find(
    (lesson) => lesson.id === selectedLessonId
  );

  // Handle row click
  const handleRowClick = (lesson) => {
    setSelectedLessonId(lesson.id);
  };

  // Handle modal close
  const handleModalClose = () => {
    setSelectedLessonId(null);
  };

  // Apply client-side skill filter
  const filteredLessons = useMemo(
    () =>
      lessons.filter(
        (lesson) => skillFilter === "all" || lesson.skill.id === skillFilter
      ),
    [lessons, skillFilter]
  );

  const columns = useMemo(() => getColumns(isTeacherMode), [isTeacherMode]);

  if (lessons.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        You don&apos;t have any {isTeacherMode ? "teaching" : "learning"}{" "}
        sessions yet.
      </div>
    );
  }

  return (
    <>
      <SortableTable
        data={filteredLessons}
        columns={columns}
        onRowClick={handleRowClick}
      />
      {/* Teacher Modal */}
      {isTeacherMode && selectedLesson && (
        <TeacherLessonModal
          lesson={selectedLesson}
          open={!!selectedLesson}
          onClose={handleModalClose}
          onUpdate={onUpdate}
        />
      )}
      {/* Student Modal */}
      {!isTeacherMode && selectedLesson && (
        <StudentEnrollmentModal
          lesson={selectedLesson}
          open={!!selectedLesson}
          onClose={handleModalClose}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}

// Main component
export function MyLessons() {
  const [statusFilter, setStatusFilter] = useState(null);
  const [timeframeFilter, setTimeframeFilter] = useState("upcoming");
  const [skillFilter, setSkillFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("teacher");

  // Prepare GraphQL filter variables
  const filterVariables = useMemo(() => {
    const filter = {};
    if (statusFilter) filter.status = statusFilter;

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

  const filterContextValue = {
    statusFilter,
    setStatusFilter,
    timeframeFilter,
    setTimeframeFilter,
    skillFilter,
    setSkillFilter,
    allSkills,
  };

  const handleLessonUpdated = () => {
    refetch(filterVariables);
  };

  return (
    <LessonFiltersContext.Provider value={filterContextValue}>
      <div className="space-y-4">
        <FiltersUI />

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
                  mode="teacher"
                  onUpdate={handleLessonUpdated}
                />
              </TabsContent>
              <TabsContent value="student">
                <LessonsTable
                  lessons={data?.myLessonsAsStudent || []}
                  mode="student"
                  onUpdate={handleLessonUpdated}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </LessonFiltersContext.Provider>
  );
}
