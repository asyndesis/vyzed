// Applies pending Drizzle migrations. Run by Fly's release_command on each deploy.
// Plain ESM with only drizzle-orm + pg, so the runtime image needs no devDependencies.
// The migrator tracks applied migrations, so re-running is a no-op.
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const db = drizzle({ connection: url });

try {
  await migrate(db, {
    migrationsFolder: new URL("../src/server/db/migrations", import.meta.url).pathname,
  });
  console.log("Migrations up to date");
} catch (error) {
  console.error("Migration failed:", error);
  process.exitCode = 1;
} finally {
  await db.$client.end();
}
