# Structure

Root `src/` folders are sorted by kind. `src/features/<name>/` uses the same kind folders.

```
src/
  components/  hooks/  lib/   app-wide (components/ui = shadcn)
  features/<name>/
    components/  hooks/  lib/   lib/rules.ts = business rules shared with server; lib/queries.ts
  generated/   tool output, never edit (route tree, gql.tada, paraglide)
  i18n/        messages/ + project.inlang/
  routes/      TanStack file routes, kept thin
  server/      server-only: db (+ migrations), graphql, auth
```

Where a file goes, first match wins: tool output → `generated/`; server-only → `server/`;
page → `routes/`; used by one feature → `features/<name>/<kind>/`; otherwise → `src/<kind>/`.
Kind: component → `components/`, hook → `hooks/`, anything else → `lib/`. No other
folder names inside a feature.

## Rules

- Files are kebab-case (`teacher-card.tsx` exports `TeacherCard`).
- Import with `@/` paths. Helpers come from `@/lib/gql`, never `gql.tada` directly.
- Features import downward only: `skills` ← `lessons` ← `teachers`, `profile`; `auth`
  can be imported by any feature. Code needed sideways moves to `src/<kind>/`.
- Client code imports `server/` only through `createServerFn` with a dynamic import.
- GraphQL: each component defines its fragment in its own file (keep masking on).
  `lib/queries.ts` is only for queries that several components share.

## Commands

- Don't run `npm run build` while `npm run dev` is running.
- Run `npm run gql` after changing the GraphQL schema.
- Never edit files in `src/server/db/migrations` by hand; use `npm run db:generate`.
