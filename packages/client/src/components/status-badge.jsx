import { Badge } from "@/components/ui/badge";
import { LessonStatus } from "@vyzed/prisma/enums";

// Utility function to get badge variant based on status
function getStatusVariant(status) {
  switch (status) {
    case LessonStatus.COMPLETED:
      return "success";
    case LessonStatus.CONFIRMED:
      return "primary";
    case LessonStatus.CANCELLED:
    case LessonStatus.REJECTED:
      return "destructive";
    case LessonStatus.REQUESTED:
      return "warning";
    default:
      return "outline";
  }
}

// Status badge using shadcn Badge component with custom className
export function StatusBadge({ status }) {
  return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
}
