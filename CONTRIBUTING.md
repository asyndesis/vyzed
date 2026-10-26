# 🤝 Contributing

## 🌿 Workflow

1. Branch off `main`.
2. Run `npm run check` until it passes.
3. Open a PR titled in [Conventional Commits](https://www.conventionalcommits.org) format, such as `feat: add bio field` or `fix: nest field hint`.
4. Squash-merge once every check is green. The PR title becomes the commit message on `main`.

> Never `--no-verify`. If a gate fails, fix the code, not the rule.

## 🗂️ Where code goes

| What                     | Folder                                        |
| ------------------------ | --------------------------------------------- |
| Pages                    | `src/routes/` (kept thin)                     |
| Used by one feature      | `src/features/<name>/{components,hooks,lib}/` |
| Shared                   | `src/{components,hooks,lib}/`                 |
| Server-only              | `src/server/`                                 |
| Tool output (never edit) | `src/generated/`                              |
| shadcn (never edit)      | `src/components/ui/`                          |

Features never import other features. Shared code moves up to `src/`.

## 📐 Conventions

- **shadcn:** don't edit `src/components/ui/`. Wrap or compose components in `src/components/`, theme them with CSS tokens in `src/styles.css`, and update them with `npx shadcn@latest add -o <name>`.
- **Class names:** merge them with shadcn's `cn` (`import { cn } from "cn"`). Don't use `clsx`, `tailwind-merge` or custom helpers.
- **GraphQL:** each component owns its fragment. `lib/queries.ts` holds only queries that several components share.
- **Migrations:** generate them with `npm run db:generate`. Never edit them by hand.

## 🚦 Gates

The pre-push hook runs the fast gates. CI runs every gate on each PR.

| Gate              | Checks                               | Pre-push | CI  |
| ----------------- | ------------------------------------ | :------: | :-: |
| `check:format`    | Formatting (`npm run format` fixes)  |    ✅    | ✅  |
| `lint`            | Imports and feature boundaries       |    ✅    | ✅  |
| `check:names`     | kebab-case files and folders         |    ✅    | ✅  |
| `typecheck`       | TypeScript                           |    ✅    | ✅  |
| `test`            | Vitest                               |    ✅    | ✅  |
| `check:generated` | Schema and migrations are current    |          | ✅  |
| `build`           | Server code stays out of the browser |          | ✅  |
| PR title          | Conventional Commits format          |          | ✅  |

Each gate's error message says what to fix.

## 🚀 Deploy

Once CI passes on `main`, the commit deploys to Fly automatically. Migrations run during the release.
