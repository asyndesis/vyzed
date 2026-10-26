import { PGlite } from "@electric-sql/pglite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { beforeEach, vi } from "vitest";
import { relations } from "@/server/db/relations";

// Server code gets a real Postgres in memory, built from the production migrations.
// (env.ts validates on import; nothing connects to these.)
process.env.DATABASE_URL = "postgres://test:test@localhost:5432/test";
process.env.BETTER_AUTH_SECRET = "test-secret-test-secret-test-secret";
process.env.BETTER_AUTH_URL = "http://localhost:3100";

const db = drizzle({ client: new PGlite(), relations });
await migrate(db, { migrationsFolder: "./drizzle" });

vi.mock("@/server/db", () => ({ db }));

beforeEach(async () => {
  const { rows } = await db.execute<{ tablename: string }>(
    sql`select tablename from pg_tables where schemaname = 'public'`,
  );
  const tables = rows.map((r) => `"${r.tablename}"`).join(", ");
  await db.execute(sql.raw(`truncate ${tables} cascade`));
});
