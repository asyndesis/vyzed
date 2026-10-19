import { type InferSchemaType, model, Schema } from "mongoose";

const teacherProfileSchema = new Schema(
  {
    /** Better Auth `user._id` */
    userId: { type: Schema.Types.ObjectId, required: true, unique: true },
    displayName: { type: String, required: true, trim: true },
    headline: { type: String, default: "" },
    bio: { type: String, default: "" },
    subjects: { type: [String], default: [], index: true },
    languages: { type: [String], default: [] },
    hourlyRateCents: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    timezone: { type: String, required: true },
    avatarUrl: { type: String },
    published: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

// Basic text search. Swap for an Atlas Search index once you need fuzzy matching/facets.
teacherProfileSchema.index(
  { displayName: "text", headline: "text", bio: "text", subjects: "text" },
  { weights: { displayName: 5, subjects: 4, headline: 3, bio: 1 } },
);

export type TeacherProfile = InferSchemaType<typeof teacherProfileSchema>;
export const TeacherProfileModel = model("TeacherProfile", teacherProfileSchema);
