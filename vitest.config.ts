import { defineConfig } from "vitest/config";

// Kept apart from vite.config.ts: the Start, Nitro and devtools plugins don't belong in tests.
//   unit  pure domain rules
//   api   the GraphQL schema against a real Postgres (in-memory PGlite)
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    projects: [
      {
        extends: true,
        test: { name: "unit", include: ["src/domain/**/*.test.ts"] },
      },
      {
        extends: true,
        test: {
          name: "api",
          include: ["src/server/**/*.test.ts"],
          setupFiles: ["src/server/test/setup.ts"],
          // Pothos would otherwise load graphql's CommonJS build while tests load the ESM
          // one, and graphql refuses to run with two copies
          server: { deps: { inline: [/@pothos/, /graphql/] } },
        },
      },
    ],
  },
});
