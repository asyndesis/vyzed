import { configDefaults, defineConfig } from "vitest/config";

// Kept apart from vite.config.ts: the Start, Nitro and devtools plugins don't belong in tests.
//   unit  pure logic anywhere outside src/server
//   api   the GraphQL schema against a real Postgres (in-memory PGlite)
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    // A lean floor for logic, set just under today's numbers. Raise it as tests land.
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/features/*/lib/**", "src/server/**"],
      exclude: ["**/*.test.ts", "src/server/test/**", "src/server/db/**"],
      thresholds: { statements: 50, branches: 40, functions: 50, lines: 50 },
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          exclude: [...configDefaults.exclude, "src/server/**"],
        },
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
