import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "@/env";
import { relations } from "@/server/db/relations";

export const db = drizzle({ connection: env.DATABASE_URL, relations });

export type DB = typeof db;
