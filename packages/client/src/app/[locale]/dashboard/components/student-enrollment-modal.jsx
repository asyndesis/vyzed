"use client";
import { useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon as CheckIcon,
  XCircleIcon,
  BanknoteIcon,
  DollarSignIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  SendHorizonal as RequestIcon,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VALID_ENROLLMENT_STATUS_TRANSITIONS } from "@vyzed/constants/lessons";

// GraphQL Mutations
const CHANGE_ENROLLMENT_STATUS = gql`
  mutation ChangeEnrollmentStatus(
    $enrollmentId: PostgresID!
    $status: LessonStatus!
  ) {
    changeEnrollmentStatus(enrollmentId: $enrollmentId, status: $status) {
      id
      status
    }
  }
`;

const UPDATE_ENROLLMENT_PAYMENT_STATUS = gql`
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

export function StudentEnrollmentModal({ lesson, open, onClose, onUpdate }) {
  const [isLoading, setIsLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Get the student's enrollment from the lesson (assuming only one enrollment per lesson for a student)
  const enrollment = lesson?.enrollments?.[0];

  // Status change mutation
  const [changeEnrollmentStatus] = useMutation(CHANGE_ENROLLMENT_STATUS, {
    onCompleted: () => {
      onUpdate?.();
      onClose();
    },
    onError: (error) => {
      console.error("Error changing enrollment status:", error);
      setIsLoading(false);
    },
  });

  // Payment update mutation
  const [updateEnrollmentPaymentStatus] = useMutation(
    UPDATE_ENROLLMENT_PAYMENT_STATUS,
    {
      onCompleted: () => {
        onUpdate?.();
        onClose();
      },
      onError: (error) => {
        console.error("Error updating payment status:", error);
        setProcessingPayment(false);
      },
    },
  );

  if (!lesson || !enrollment) return null;

  // Handle enrollment status changes (e.g., cancellation)
  const handleStatusChange = (newStatus) => {
    setIsLoading(true);
    changeEnrollmentStatus({
      variables: {
        enrollmentId: enrollment.id,
        status: newStatus,
      },
    });
  };

  // Handle student payment confirmation
  const handlePaymentUpdate = (isPaid) => {
    setProcessingPayment(true);
    updateEnrollmentPaymentStatus({
      variables: {
        enrollmentId: enrollment.id,
        isPaid: isPaid,
      },
    });
  };

  // Use enrollment status for student context
  const currentStudentStatus = enrollment.status;
  const isPastLesson = new Date(lesson.endTime) < new Date();

  // Determine valid actions for the student based on transitions
  const allowedTransitions =
    VALID_ENROLLMENT_STATUS_TRANSITIONS[currentStudentStatus] || [];

  const canCancel = allowedTransitions.includes(LessonStatus.CANCELLED);
  const canRequestAgain = allowedTransitions.includes(LessonStatus.REQUESTED);
  const canConfirmRevision = allowedTransitions.includes(
    LessonStatus.CONFIRMED,
  );

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
              <StatusBadge status={currentStudentStatus} />
            </div>
          </div>
          <DialogDescription className="text-sm text-muted-foreground mt-1.5">
            {currentStudentStatus === LessonStatus.REQUESTED
              ? "Your request is pending teacher approval."
              : currentStudentStatus === LessonStatus.CONFIRMED
                ? "This lesson is confirmed and scheduled."
                : currentStudentStatus === LessonStatus.CANCELLED
                  ? "This lesson enrollment has been cancelled."
                  : currentStudentStatus === LessonStatus.COMPLETED
                    ? "This lesson has been completed."
                    : currentStudentStatus === LessonStatus.REVISED
                      ? "The teacher proposed changes. Please review and confirm or cancel."
                      : "View your lesson details."}
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

            {/* Teacher Information - Removed Card, No Separator After */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Teacher
              </h3>
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9 border">
                  <AvatarImage src={lesson.teacher?.imageUrl} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(
                      lesson.teacher?.firstName,
                      lesson.teacher?.lastInitial,
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm font-medium">
                  {lesson.teacher?.firstName} {lesson.teacher?.lastInitial}
                </div>
              </div>
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
          {(canCancel || canRequestAgain || canConfirmRevision) && (
            <div className="pt-2 pb-1">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Actions
              </h3>
              <div className="flex gap-3 w-full">
                {/* Actions for REVISED state */}
                {currentStudentStatus === LessonStatus.REVISED && (
                  <>
                    {/* Cancel/Reject Revision Button */}
                    {canCancel && (
                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleStatusChange(LessonStatus.CANCELLED)
                        }
                        disabled={isLoading}
                        className={cn("flex-1", isLoading && "opacity-70")}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 mr-2" />
                        )}
                        {isLoading ? "Processing..." : "Cancel Lesson"}
                      </Button>
                    )}
                    {/* Confirm Revision Button */}
                    {canConfirmRevision && (
                      <Button
                        onClick={() =>
                          handleStatusChange(LessonStatus.CONFIRMED)
                        }
                        disabled={isLoading}
                        className={cn(
                          "flex-1 bg-green-600 hover:bg-green-700 text-white",
                          isLoading && "opacity-70",
                        )}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckIcon className="h-4 w-4 mr-2" />
                        )}
                        {isLoading ? "Processing..." : "Confirm Changes"}
                      </Button>
                    )}
                  </>
                )}

                {/* Other state actions (only show if not REVISED) */}
                {currentStudentStatus !== LessonStatus.REVISED && (
                  <>
                    {/* Show Cancel button if applicable (for REQUESTED/CONFIRMED) */}
                    {canCancel && (
                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleStatusChange(LessonStatus.CANCELLED)
                        }
                        disabled={isLoading}
                        className={cn("flex-1", isLoading && "opacity-70")}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 mr-2" />
                        )}
                        {isLoading ? "Processing..." : "Cancel Enrollment"}
                      </Button>
                    )}

                    {/* Show Re-request button if applicable (for CANCELLED) */}
                    {canRequestAgain && (
                      <Button
                        variant="default"
                        onClick={() =>
                          handleStatusChange(LessonStatus.REQUESTED)
                        }
                        disabled={isLoading}
                        className={cn("flex-1", isLoading && "opacity-70")}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RequestIcon className="h-4 w-4 mr-2" />
                        )}
                        {isLoading ? "Processing..." : "Re-request Lesson"}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          <Separator /> {/* Separator before Payment section */}
          {/* Payment Information - Kept Card Structure */}
          {enrollment.paymentType !== PaymentType.FREE && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Payment
              </h3>
              <Card className="overflow-hidden">
                <CardHeader className="py-3 px-4 bg-background border-b flex flex-row items-center justify-between space-y-0 gap-3">
                  <div className="flex items-center gap-3">
                    <BanknoteIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-sm font-semibold">
                        {enrollment.paymentType}
                      </CardTitle>
                      {enrollment.paymentAmount && (
                        <p className="text-xs text-muted-foreground">
                          {enrollment.paymentAmount}{" "}
                          {enrollment.paymentCurrency}
                        </p>
                      )}
                    </div>
                  </div>
                  <PaymentStatusBadge enrollment={enrollment} />
                </CardHeader>
                <CardContent className="p-3 bg-muted/10">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-sm text-muted-foreground">
                        {enrollment.studentPaymentAt ? (
                          <span className="text-green-600 flex items-center">
                            <CheckIcon className="h-3.5 w-3.5 mr-1.5" />
                            You confirmed payment
                          </span>
                        ) : (
                          <span className="text-muted-foreground flex items-center">
                            <ArrowRightIcon className="h-3.5 w-3.5 mr-1.5" />
                            Your payment confirmation needed
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={
                        enrollment.studentPaymentAt ? "outline" : "default"
                      }
                      onClick={() =>
                        handlePaymentUpdate(!enrollment.studentPaymentAt)
                      }
                      disabled={processingPayment}
                      className="w-full mt-1"
                    >
                      {processingPayment ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          Processing...
                        </>
                      ) : enrollment.studentPaymentAt ? (
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
                </CardContent>
              </Card>
            </div>
          )}
          {enrollment.paymentType === PaymentType.FREE && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Payment
              </h3>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Free lesson
              </Badge>
            </div>
          )}
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
