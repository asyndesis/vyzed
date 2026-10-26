# 🤝 Contributing

## 🌿 Workflow

1. Branch off `main`
2. Make sure `npm run check` passes
3. Open a PR. `main` only merges green PRs

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

## 🚦 Gates

| Gate              | Checks                               | Push | CI  |
| ----------------- | ------------------------------------ | :--: | :-: |
| `check:format`    | Formatting                           |  ✅  | ✅  |
| `lint`            | Imports and feature boundaries       |  ✅  | ✅  |
| `check:names`     | kebab-case files and folders         |  ✅  | ✅  |
| `typecheck`       | TypeScript                           |  ✅  | ✅  |
| `test`            | Vitest                               |  ✅  | ✅  |
| `check:generated` | Schema and migrations are current    |      | ✅  |
| `build`           | Server code stays out of the browser |      | ✅  |

Errors tell you what to fix.
