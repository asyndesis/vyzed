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
Kind: component → `components/`, hook → `hooks/`, anything else → `lib/`.

## Rules

- Features never import other features: shared code moves to `src/<kind>/`,
  and routes compose features. Inside a feature, import its own files relatively.
- GraphQL: each component defines its fragment in its own file (keep masking on).
  `lib/queries.ts` is only for queries that several components share.
- Naming, import paths and server/client boundaries are enforced by oxlint
  (`.oxlintrc.json`), ls-lint (`.ls-lint.yml`) and the build (`importProtection` in
  `vite.config.ts`); their errors say what to do. Fix the code, not the rule.

## Commands

- Don't run `npm run build` while `npm run dev` is running.
- Never edit files in `src/server/db/migrations` by hand; use `npm run db:generate`.
- `npm run check` must pass before a change is done. CI runs it plus `npm run build` on
  every PR, and `git push` runs the fast part (format, lint, typecheck, test).
- Work on a branch and open a PR; `main` is protected and only merges green PRs.
- Never bypass hooks (`--no-verify`). If a gate fails, fix the cause.
