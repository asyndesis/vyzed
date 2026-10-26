# Project structure

Root `src/` folders are sorted by **kind**. Each feature under `src/features/<name>/` uses
the same kind folders, so every file has exactly one correct place.

```
src/
  components/        app-wide React components (ui/ = shadcn, shells, layout, logo, avatar)
  hooks/             app-wide React hooks
  lib/               app-wide non-React code (gql client, format, utils)
  features/
    <name>/
      components/    the feature's React components (*.tsx)
      hooks/         the feature's React hooks (use-*.ts)
      lib/           the feature's non-React code:
                       rules.ts       business rules + constants (no React, no db),
                                      shared by the GraphQL resolvers and the UI
                       rules.test.ts  unit tests for rules.ts
                       queries.ts     GraphQL queries/mutations used by more than one
                                      component in the feature (+ query options)
                       *.ts           anything else non-React (clients, server fns)
  graphql/           generated schema.graphql + gql.tada types (npm run gql)
  i18n/              messages/ (edit), project.inlang/ (settings), paraglide/ (generated)
  routes/            TanStack file routes (path = URL)
  server/            server-only: db/ (+ migrations/), graphql/, auth, test/
```

Features: `auth`, `skills`, `lessons`, `teachers`, `profile`.

## Where does a new file go?

1. Is it server-only (db, resolvers, auth server)? → `src/server/`
2. Is it a page? → `src/routes/`
3. Does only one feature use it? → `src/features/<feature>/<kind>/`
4. Otherwise (used by several features, or by none in particular) → `src/<kind>/`

`<kind>` is decided by the file alone: `.tsx` component → `components/`, React hook →
`hooks/`, everything else → `lib/`. Use no other folder names inside a feature. Only
create a kind folder once it has a file.

## GraphQL (gql.tada)

- A component declares the data it needs as a fragment **in its own file** and reads it
  with `readFragment`. Keep fragment masking on.
- The query that loads a screen composes those fragments and lives with the top-level
  component or route that runs it. Only queries shared within a feature go in
  `lib/queries.ts`. Queries shared across features go in the lower feature's
  `lib/queries.ts` (`Me` → profile, `SkillTree` → skills).
- Import `graphql`, `readFragment` and related helpers from `@/lib/gql`, never directly from `gql.tada`.

## Dependency rules

- Features import each other downward only, never in a cycle:
  `skills` ← `lessons` ← `teachers`, `profile`. `auth` may be imported by any feature.
  If code is needed sideways, move it to root `src/<kind>/`.
- Root `components/`, `hooks/` and `lib/` may import from features only for app-wide
  wiring (shells, providers).
- Routes stay thin: they load data and put feature pieces together, without holding
  logic of their own.
- Client code never imports `server/`, except via `createServerFn` with a dynamic import
  (see `features/auth/lib/session.ts`).
- Always import with `@/` paths. The one exception is a test importing the file it
  tests (`./rules`).

## Commands

- `npm run dev` (port 3100). Don't run `npm run build` while the dev server is running.
- `npx vitest run` runs unit tests (`features/**/*.test.ts`) and API tests
  (`server/**/*.test.ts`, against in-memory PGlite).
- `npm run typecheck`, `npm run lint`, `npm run format`
- `npm run db:generate` / `db:migrate` work with migrations in `src/server/db/migrations`.
  Don't hand-edit or reformat files in there.
- `npm run gql` regenerates `src/graphql/schema.graphql` and the gql.tada types after
  changing the GraphQL schema.
