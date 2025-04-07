import { Badge } from "@/components/ui/badge";
import { Check, Clock, DollarSign } from "lucide-react";
import { PaymentType } from "@vyzed/prisma/enums";

// Payment status badge component
export function PaymentStatusBadge({ enrollment }) {
  if (!enrollment || enrollment.paymentType === PaymentType.FREE) {
    return <Badge variant="success">Free</Badge>;
  }

  const bothConfirmed =
    enrollment.teacherPaymentAt && enrollment.studentPaymentAt;

  // Payment fully confirmed
  if (bothConfirmed) {
    return (
      <Badge variant="success" className="flex items-center">
        <Check className="h-3.5 w-3.5 mr-1.5" />
        Complete
      </Badge>
    );
  }

  // Partially confirmed
  if (enrollment.studentPaymentAt || enrollment.teacherPaymentAt) {
    return (
      <Badge variant="outline" className="flex items-center">
        <Clock className="h-3.5 w-3.5 mr-1.5" />
        Confirming
      </Badge>
    );
  }

  // No confirmation
  return (
    <Badge variant="warning" className="flex items-center">
      <DollarSign className="h-3.5 w-3.5 mr-1.5" />
      Unpaid
    </Badge>
  );
}
