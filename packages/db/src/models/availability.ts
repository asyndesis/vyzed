import { type InferSchemaType, model, Schema } from "mongoose";

const weeklyRuleSchema = new Schema(
  {
    weekday: { type: Number, min: 0, max: 6, required: true },
    startMinute: { type: Number, min: 0, max: 1440, required: true },
    endMinute: { type: Number, min: 0, max: 1440, required: true },
  },
  { _id: false },
);

const availabilitySchema = new Schema(
  {
    /** Better Auth `user._id` of the teacher */
    teacherId: { type: Schema.Types.ObjectId, required: true, unique: true },
    /** Rules are interpreted in this IANA zone so they follow the teacher's DST. */
    timezone: { type: String, required: true },
    rules: { type: [weeklyRuleSchema], default: [] },
    /** Bumped inside every booking transaction so concurrent bookings for one teacher conflict. */
    bookingSeq: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type Availability = InferSchemaType<typeof availabilitySchema>;
export const AvailabilityModel = model("Availability", availabilitySchema);
