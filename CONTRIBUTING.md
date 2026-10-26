# Contributing

## Workflow

Work on a branch and open a PR. `main` is protected and only merges PRs whose checks pass.
Before you push, `npm run check` should pass. Never skip hooks with `--no-verify`: if a gate
fails, fix the cause.

## Structure

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

- Features never import other features: shared code moves to `src/<kind>/`, and routes
  compose features.
- GraphQL: each component defines its fragment in its own file (keep masking on).
  `lib/queries.ts` is only for queries that several components share.
- Never edit `src/server/db/migrations` by hand; change the schema and run
  `npm run db:generate`.

## Gates

Most rules above are checked by tools. Their errors say what to do. Fix the code, not the rule.

| Gate                      | Checks                                                                                                                        | Config                                       | `git push` | CI job              |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------- | ------------------- |
| `npm run check:format`    | Formatting (oxfmt)                                                                                                            | `.oxfmtrc.json`                              | yes        | Format, lint, types |
| `npm run lint`            | Imports: features stay separate, `@/` paths, `gql.tada` only via `@/lib/gql`, no cycles; React and correctness rules (oxlint) | `.oxlintrc.json`, `scripts/oxlint-plugin.js` | yes        | Format, lint, types |
| `npm run check:names`     | kebab-case files; features contain only `components/`, `hooks/`, `lib/` (ls-lint)                                             | `.ls-lint.yml`                               | yes        | File names          |
| `npm run typecheck`       | TypeScript                                                                                                                    | `tsconfig.json`                              | yes        | Format, lint, types |
| `npm run test`            | Unit tests (Vitest)                                                                                                           | `vitest.config.ts`                           | yes        | Tests               |
| `npm run check:generated` | GraphQL schema and migrations are up to date with the code                                                                    | `package.json`                               | no         | Generated files     |
| `npm run build`           | Production build; fails if `src/server/` code reaches the browser bundle                                                      | `importProtection` in `vite.config.ts`       | no         | Build               |

`npm run check` runs every gate except the build. The pre-push hook is `.husky/pre-push`, and
CI is `.github/workflows/ci.yml`.
