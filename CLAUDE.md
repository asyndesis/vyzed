# Project structure

```
src/
  features/<name>/  one folder per feature: its rules, queries and components
  components/       app-wide UI: ui/ (shadcn), shells, layout, logo, avatar
  lib/              generic helpers with no feature knowledge (gql, format, utils)
  hooks/            generic React hooks
  i18n/             messages/, project.inlang/, generated paraglide/
  routes/           TanStack file routes
  server/           server-only: db (+ migrations), graphql, auth, test helpers
```

## Inside a feature

- `rules.ts`: plain business logic and constants (no React, no db), shared by the GraphQL
  resolvers and the UI. Unit tests sit next to it as `rules.test.ts`.
- `queries.ts`: GraphQL documents and query options for the feature.
- `*.tsx`: the feature's components.
- Keep feature folders flat. Once one passes ~8–10 files, give that feature the
  subfolders it needs, mirroring root (`components/`, `lib/`, `hooks/`). Other
  features don't have to follow.

## Dependency rules

- Root `components/`, `lib/` and `hooks/` hold only code used across features. Code
  used by one feature lives in that feature.
- Features import other features only downward, never in a cycle:
  `skills` ← `lessons` ← `teachers`, `profile`. `auth` is usable by any feature.
  If two features need the same code and neither sits below the other, move it to root.
- Routes stay thin: they load data and put feature pieces together, without holding
  logic of their own.
- `server/` is never imported from client code, except via `createServerFn` with a
  dynamic import (see `features/auth/session.ts`).

## Commands

- `npm run dev` (port 3100). Don't run `npm run build` while the dev server is running.
- `npx vitest run` runs unit tests (`features/**/*.test.ts`) and API tests
  (`server/**/*.test.ts`, against in-memory PGlite).
- `npm run typecheck`, `npm run lint`, `npm run format`
- `npm run db:generate` / `db:migrate` work with migrations in `src/server/db/migrations`.
  Don't hand-edit or reformat files in there.
- `npm run gql` regenerates `src/graphql/schema.graphql` and the gql.tada types after
  changing the GraphQL schema.
