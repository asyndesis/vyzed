@CONTRIBUTING.md

- Don't run `npm run build` while `npm run dev` is running.
- GraphQL: each component owns its fragment; `lib/queries.ts` is for queries several components share.
- Never edit migrations by hand; use `npm run db:generate`.
- Never edit `src/components/ui/` (shadcn output). Wrap or compose in `src/components/`; theme via CSS tokens in `src/styles.css`. Update with `npx shadcn@latest add -o <name>`.
- Merge class names with shadcn's `cn` (`import { cn } from "cn"`, as `ui/` does). No `clsx`, `tailwind-merge`, or custom helpers.
