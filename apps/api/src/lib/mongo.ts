import { MongoClient } from "mongodb";
import { env } from "../env";

/** Shared driver client: used by Better Auth directly and handed to Mongoose on startup. */
export const mongoClient = new MongoClient(env.MONGODB_URI, { maxPoolSize: 20 });
