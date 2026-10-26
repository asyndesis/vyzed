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
- These rules are enforced: imports by oxlint (`.oxlintrc.json`), names by ls-lint
  (`.ls-lint.yml`), and server code in the browser by the build (`importProtection` in
  `vite.config.ts`). Fix the code, not the rule.
- `npm run check` must pass before a change is done. CI runs it plus `npm run build` on
  every PR, and `git push` runs the fast part (format, lint, typecheck, test).
- Work on a branch and open a PR; `main` is protected and only merges green PRs.
- Never bypass hooks (`--no-verify`). If a gate fails, fix the cause.
