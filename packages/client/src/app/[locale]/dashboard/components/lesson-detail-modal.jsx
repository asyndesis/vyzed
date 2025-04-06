"use client";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, User, CheckCircle, XCircle } from "lucide-react";
import { gql, useMutation } from "@apollo/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LessonStatus } from "@vyzed/prisma/enums";
import UserSkillBadge from "@/components/user-skill-badge";
import { StatusBadge } from "@/components/status-badge";

// GraphQL mutations for approving and rejecting lessons
const CHANGE_LESSON_STATUS = gql`
  mutation ChangeLessonStatus($input: ChangeLessonStatusInput!) {
    changeLessonStatus(input: $input) {
      id
      status
    }
  }
`;

export function LessonDetailModal({
  lesson,
  isOpen,
  onClose,
  onLessonUpdated,
  isTeacher,
}) {
  const [isLoading, setIsLoading] = useState(false);

  const [changeLessonStatus] = useMutation(CHANGE_LESSON_STATUS, {
    onCompleted: () => {
      setIsLoading(false);
      onLessonUpdated && onLessonUpdated();
      onClose();
    },
    onError: (error) => {
      console.error(`Error changing lesson status: ${error}`);
      setIsLoading(false);
    },
  });

  const handleStatusChange = (newStatus) => {
    setIsLoading(true);
    changeLessonStatus({
      variables: {
        input: {
          lessonId: lesson.id,
          status: newStatus,
        },
      },
    });
  };

  if (!lesson) return null;

  // Determine which actions to show based on current status
  const isPending = lesson.status === LessonStatus.REQUESTED;
  const isConfirmed = lesson.status === LessonStatus.CONFIRMED;
  const showApproveReject = isTeacher && isPending;
  const showCompleteCancel = isTeacher && isConfirmed;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Lesson Details</span>
            <StatusBadge status={lesson.status} />
          </DialogTitle>
          <DialogDescription>
            {isPending
              ? "This lesson is waiting for your approval"
              : isConfirmed
                ? "This lesson has been confirmed"
                : "View details about this lesson"}
          </DialogDescription>
        </DialogHeader>

        <div className="divide-y">
          {/* Skill Information */}
          <div className="py-3">
            <div className="text-sm font-medium text-gray-500 mb-2">Skill</div>
            <UserSkillBadge
              userSkill={{
                skill: lesson.skill,
                proficiency: lesson.proficiency,
                framework: lesson.skill.framework,
              }}
            />
          </div>

          {/* Date & Time */}
          <div className="py-3">
            <div className="text-sm font-medium text-gray-500 mb-2">
              Date & Time
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center text-sm">
                <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                <span>
                  {format(new Date(lesson.startTime), "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                <span>
                  {format(new Date(lesson.startTime), "h:mm a")} -{" "}
                  {format(new Date(lesson.endTime), "h:mm a")}
                </span>
              </div>
            </div>
          </div>

          {/* Participant Information */}
          <div className="py-3">
            <div className="text-sm font-medium text-gray-500 mb-2">
              {isTeacher ? "Student" : "Teacher"}
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-sm">
                {isTeacher ? (
                  lesson.enrollments?.[0]?.student ? (
                    <>
                      {lesson.enrollments[0].student.firstName}{" "}
                      {lesson.enrollments[0].student.lastInitial}
                    </>
                  ) : (
                    <span className="text-gray-400">No student enrolled</span>
                  )
                ) : (
                  <>
                    {lesson.teacher.firstName} {lesson.teacher.lastInitial}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Payment Information - only show if relevant */}
          {isTeacher && lesson.enrollments?.[0] && (
            <div className="py-3">
              <div className="text-sm font-medium text-gray-500 mb-2">
                Payment
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span>{lesson.enrollments[0].paymentType}</span>
                </div>
                {lesson.enrollments[0].paymentAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span>
                      {lesson.enrollments[0].paymentAmount}{" "}
                      {lesson.enrollments[0].paymentCurrency}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex pt-2">
          {showApproveReject && (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => handleStatusChange(LessonStatus.CANCELLED)}
                disabled={isLoading}
                className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {isLoading ? "Processing..." : "Reject"}
              </Button>
              <Button
                onClick={() => handleStatusChange(LessonStatus.CONFIRMED)}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isLoading ? "Processing..." : "Approve"}
              </Button>
            </div>
          )}

          {showCompleteCancel && (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => handleStatusChange(LessonStatus.CANCELLED)}
                disabled={isLoading}
                className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {isLoading ? "Processing..." : "Cancel"}
              </Button>
              <Button
                onClick={() => handleStatusChange(LessonStatus.COMPLETED)}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isLoading ? "Processing..." : "Complete"}
              </Button>
            </div>
          )}

          {!showApproveReject && !showCompleteCancel && (
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
