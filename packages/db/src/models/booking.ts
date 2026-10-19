import { ACTIVE_BOOKING_STATUSES, bookingStatusSchema } from "@vyzed/shared";
import { type InferSchemaType, model, Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    teacherId: { type: Schema.Types.ObjectId, required: true },
    learnerId: { type: Schema.Types.ObjectId, required: true },
    startUtc: { type: Date, required: true },
    endUtc: { type: Date, required: true },
    status: {
      type: String,
      enum: bookingStatusSchema.options,
      default: "pending",
      required: true,
    },
    priceCents: { type: Number, required: true },
    currency: { type: String, required: true },
    note: { type: String },
  },
  { timestamps: true },
);

bookingSchema.index({ teacherId: 1, startUtc: 1 });
bookingSchema.index({ learnerId: 1, startUtc: 1 });
// Backstop against two active bookings with the same start; overlap checks happen in a transaction.
bookingSchema.index(
  { teacherId: 1, startUtc: 1 },
  {
    name: "uniq_active_teacher_start",
    unique: true,
    partialFilterExpression: { status: { $in: [...ACTIVE_BOOKING_STATUSES] } },
  },
);

export type Booking = InferSchemaType<typeof bookingSchema>;
export const BookingModel = model("Booking", bookingSchema);
