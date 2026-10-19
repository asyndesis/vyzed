import type { MongoClient } from "mongodb";
import mongoose from "mongoose";

/**
 * Point Mongoose at an already-connected MongoClient so the app shares one connection pool
 * (Better Auth uses the same client).
 */
export function useMongoClient(client: MongoClient) {
  mongoose.set("strictQuery", true);
  // Build indexes automatically in dev; in production run `syncIndexes` as a deploy step.
  mongoose.set("autoIndex", process.env.NODE_ENV !== "production");
  mongoose.connection.setClient(client);
  return mongoose.connection;
}
