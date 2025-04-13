"use client";
import { useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  BanknoteIcon,
  DollarSignIcon,
  AlertCircleIcon,
  UsersIcon,
  ArrowRightIcon,
  Loader2,
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { LessonStatus, PaymentType } from "@vyzed/prisma/enums";
import UserSkillBadge from "@/components/user-skill-badge";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PaymentStatusBadge } from "./payment-status-badge";
import { VALID_LESSON_STATUS_TRANSITIONS } from "@vyzed/constants/lessons";
import { toast } from "sonner";
// GraphQL Mutations
const CHANGE_LESSON_STATUS = gql`
  mutation ChangeLessonStatus($lessonId: PostgresID!, $status: LessonStatus!) {
    changeLessonStatus(lessonId: $lessonId, status: $status) {
      id
      status
    }
  }
`;

const UPDATE_PAYMENT_STATUS = gql`
  mutation UpdateEnrollmentPaymentStatus(
    $enrollmentId: PostgresID!
    $isPaid: Boolean!
  ) {
    updateEnrollmentPaymentStatus(
      enrollmentId: $enrollmentId
      isPaid: $isPaid
    ) {
      id
      teacherPaymentAt
      studentPaymentAt
    }
  }
`;

export function TeacherLessonModal({ lesson, open, onClose, onUpdate }) {
  const [isLoading, setIsLoading] = useState(false);
  const [processingPaymentId, setProcessingPaymentId] = useState(null);

  // Status change mutation
  const [changeLessonStatus] = useMutation(CHANGE_LESSON_STATUS, {
    onCompleted: () => {
      onUpdate?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
      setIsLoading(false);
    },
  });

  // Payment update mutation
  const [updateEnrollmentPaymentStatus] = useMutation(UPDATE_PAYMENT_STATUS, {
    onCompleted: () => {
      onUpdate?.();
      setProcessingPaymentId(null);
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setProcessingPaymentId(null);
      setIsLoading(false);
    },
  });

  if (!lesson) return null;

  // Handle status changes
  const handleStatusChange = (newStatus) => {
    setIsLoading(true);
    changeLessonStatus({
      variables: {
        lessonId: lesson.id,
        status: newStatus,
      },
    });
  };

  // Handle payment updates
  const handlePaymentUpdate = (enrollmentId, isPaid) => {
    setProcessingPaymentId(enrollmentId);
    updateEnrollmentPaymentStatus({
      variables: {
        enrollmentId,
        isPaid,
      },
    });
  };

  // Use lesson status for teacher context
  const currentLessonStatus = lesson.status;
  const isPastLesson = new Date(lesson.endTime) < new Date();

  // Determine valid actions for the teacher based on transitions
  const allowedTransitions =
    VALID_LESSON_STATUS_TRANSITIONS[currentLessonStatus] || [];

  // Check if there are unpaid enrollments that would prevent completing
  const enrollments = lesson.enrollments || [];

  // Format initials for avatar
  const getInitials = (firstName, lastInitial) => {
    return `${firstName?.[0] || ""}${lastInitial || ""}`;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !isLoading && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 bg-muted/30 border-b">
          <div className="flex items-center justify-between mb-1.5">
            <DialogTitle className="text-xl font-semibold">
              Lesson Details
            </DialogTitle>
            <div className="mr-6">
              {/* Use lesson status */}
              <StatusBadge status={currentLessonStatus} />
            </div>
          </div>
          <DialogDescription className="text-sm text-muted-foreground mt-1.5">
            {currentLessonStatus === LessonStatus.REQUESTED
              ? "Approve or cancel this lesson request."
              : currentLessonStatus === LessonStatus.CONFIRMED
                ? "This lesson is confirmed. You can complete or cancel it."
                : currentLessonStatus === LessonStatus.CANCELLED
                  ? "This lesson has been cancelled."
                  : currentLessonStatus === LessonStatus.COMPLETED
                    ? "This lesson has been completed."
                    : currentLessonStatus === LessonStatus.REVISED // Added REVISED description
                      ? "Changes proposed. Waiting for student confirmation."
                      : "Manage your lesson details."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5 space-y-6 max-h-[calc(85vh-220px)] overflow-y-auto">
          {/* Core Lesson Details Section */}
          <div className="space-y-4">
            {/* Skill Information - No Separator After */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Skill
              </h3>
              <UserSkillBadge
                className="w-fit"
                userSkill={{
                  skill: lesson.skill,
                  proficiency: lesson.proficiency,
                  framework: lesson.skill?.framework,
                }}
              />
            </div>

            {/* Date & Time - Removed bordered box, No Separator After */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Date & Time
              </h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CalendarIcon className="h-4 w-4 mr-3 text-primary/70" />
                  <span className="font-medium">
                    {format(new Date(lesson.startTime), "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <ClockIcon className="h-4 w-4 mr-3 text-primary/70" />
                  <span className="font-medium">
                    {format(new Date(lesson.startTime), "h:mm a")} –{" "}
                    {format(new Date(lesson.endTime), "h:mm a")}
                  </span>
                </div>
                {isPastLesson && (
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-200"
                    >
                      <AlertCircleIcon className="h-3 w-3 mr-1" />
                      Past lesson
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Action buttons - Now placed directly below lesson details */}
          {allowedTransitions.length > 0 && (
            <div className="pt-2 pb-1">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Actions
              </h3>
              <div className="flex gap-3 w-full">
                {allowedTransitions.includes(LessonStatus.CANCELLED) && (
                  <Button
                    variant="destructive"
                    onClick={() => handleStatusChange(LessonStatus.CANCELLED)}
                    disabled={isLoading}
                    className={cn("flex-1", isLoading && "opacity-70")}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? "Processing..." : "Cancel"}
                  </Button>
                )}

                {allowedTransitions.includes(LessonStatus.REVISED) && (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange(LessonStatus.REVISED)}
                    disabled={isLoading}
                    className={cn("flex-1", isLoading && "opacity-70")}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowRightIcon className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? "Processing..." : "Propose Changes"}
                  </Button>
                )}

                {allowedTransitions.includes(LessonStatus.CONFIRMED) && (
                  <Button
                    onClick={() => handleStatusChange(LessonStatus.CONFIRMED)}
                    disabled={isLoading}
                    className={cn(
                      "flex-1 bg-green-600 hover:bg-green-700 text-white",
                      isLoading && "opacity-70"
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? "Processing..." : "Approve"}
                  </Button>
                )}
                {allowedTransitions.includes(LessonStatus.COMPLETED) && (
                  <Button
                    onClick={() => handleStatusChange(LessonStatus.COMPLETED)}
                    disabled={isLoading}
                    className={cn(
                      "flex-1 bg-green-600 hover:bg-green-700 text-white",
                      isLoading && "opacity-70"
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? "Processing..." : "Complete"}
                  </Button>
                )}
              </div>
            </div>
          )}
          <Separator /> {/* Separator before Student section */}
          {/* Student Information - Refactored List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Students
              </h3>
              <Badge
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
              >
                <UsersIcon className="h-3 w-3 mr-1" />
                {enrollments.length} enrolled
              </Badge>
            </div>

            {enrollments.length > 0 ? (
              <div className="border rounded-md divide-y divide-border bg-background">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="p-4">
                    {/* Student Header Info */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3 flex-grow">
                        <Avatar className="h-8 w-8 border flex-shrink-0">
                          <AvatarImage src={enrollment.student?.imageUrl} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(
                              enrollment.student?.firstName,
                              enrollment.student?.lastInitial
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">
                            {enrollment.student?.firstName}{" "}
                            {enrollment.student?.lastInitial}
                          </p>
                          {enrollment.paymentType !== PaymentType.FREE && (
                            <p className="text-xs text-muted-foreground flex items-center mt-0.5">
                              <BanknoteIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                              {enrollment.paymentType}
                              {enrollment.paymentAmount && (
                                <span className="ml-1">
                                  · {enrollment.paymentAmount}{" "}
                                  {enrollment.paymentCurrency}
                                </span>
                              )}
                            </p>
                          )}
                          {enrollment.paymentType === PaymentType.FREE && (
                            <Badge
                              variant="outline"
                              size="sm"
                              className="mt-1 bg-blue-50 text-blue-700 border-blue-200"
                            >
                              Free lesson
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <StatusBadge status={enrollment.status} size="sm" />
                      </div>
                    </div>

                    {/* Payment Section (if not free) */}
                    {enrollment.paymentType !== PaymentType.FREE && (
                      <div className="space-y-3 pt-3 border-t border-dashed">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Payment Status
                          </span>
                          <PaymentStatusBadge enrollment={enrollment} />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="text-sm text-muted-foreground">
                            {enrollment.teacherPaymentAt ? (
                              <span className="text-green-600 flex items-center">
                                <CheckCircleIcon className="h-3.5 w-3.5 mr-1.5" />
                                You confirmed
                              </span>
                            ) : (
                              <span className="text-muted-foreground flex items-center">
                                <ArrowRightIcon className="h-3.5 w-3.5 mr-1.5" />
                                Your confirmation needed
                              </span>
                            )}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant={
                            enrollment.teacherPaymentAt ? "outline" : "default"
                          }
                          onClick={() =>
                            handlePaymentUpdate(
                              enrollment.id,
                              !enrollment.teacherPaymentAt
                            )
                          }
                          disabled={processingPaymentId === enrollment.id}
                          className="w-full mt-1"
                        >
                          {processingPaymentId === enrollment.id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                              Processing...
                            </>
                          ) : enrollment.teacherPaymentAt ? (
                            <>
                              <XCircleIcon className="h-3.5 w-3.5 mr-1.5" />
                              Mark as Unpaid
                            </>
                          ) : (
                            <>
                              <DollarSignIcon className="h-3.5 w-3.5 mr-1.5" />
                              Confirm Payment
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic flex items-center justify-center p-6 border rounded-md bg-muted/10">
                No students enrolled yet
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/20">
          <Button onClick={onClose} className="w-full" variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
